-- Order tracking history, realtime status coverage, and idempotent email outbox.

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'));

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  previous_status text,
  status text not null check (status in ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
  source text not null default 'system' check (source in ('system', 'admin', 'customer', 'carrier')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_idx
  on public.order_status_history(order_id, created_at asc);

create table if not exists public.order_email_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null check (event_type in (
    'order_placed',
    'order_confirmed',
    'order_processing',
    'order_shipped',
    'order_out_for_delivery',
    'order_delivered',
    'order_cancelled',
    'payment_updated',
    'return_updated',
    'shipment_details'
  )),
  event_key text not null unique,
  event_value text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  recipient_email text not null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_email_notifications_queue_idx
  on public.order_email_notifications(status, available_at, created_at);
create index if not exists order_email_notifications_order_idx
  on public.order_email_notifications(order_id, created_at desc);

alter table public.order_status_history enable row level security;
alter table public.order_email_notifications enable row level security;
alter table public.order_status_history replica identity full;

revoke all on table public.order_status_history from anon, authenticated;
revoke all on table public.order_email_notifications from anon, authenticated;
grant select on public.order_status_history to authenticated;

drop policy if exists "Customers read own order status history" on public.order_status_history;
create policy "Customers read own order status history"
on public.order_status_history for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders
    join public.customers on customers.id = orders.customer_id
    where orders.id = order_status_history.order_id
      and customers.auth_user_id = auth.uid()
  )
);

-- Backfill a first timeline event without enqueueing email for old orders.
insert into public.order_status_history (order_id, status, source, created_at)
select orders.id, orders.status, 'system', orders.created_at
from public.orders
where not exists (
  select 1
  from public.order_status_history
  where order_status_history.order_id = orders.id
);

drop function if exists public.queue_order_email_notification(uuid, text, text);

create or replace function public.queue_order_email_notification(
  p_order_id uuid,
  p_event_type text,
  p_event_key text,
  p_event_value text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.order_email_notifications (order_id, event_type, event_key, event_value, recipient_email)
  select orders.id, p_event_type, p_event_key, p_event_value, lower(trim(orders.customer_email))
  from public.orders
  where orders.id = p_order_id
    and nullif(trim(orders.customer_email), '') is not null
  on conflict (event_key) do nothing;
end;
$$;

create or replace function public.record_order_tracking_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, status, source, created_at)
    values (new.id, new.status, 'system', coalesce(new.created_at, now()));

    perform public.queue_order_email_notification(new.id, 'order_placed', new.id::text || ':order_placed', new.status);
  elsif new.status is distinct from old.status then
    insert into public.order_status_history (order_id, previous_status, status, source, created_at)
    values (new.id, old.status, new.status, 'system', coalesce(new.updated_at, now()));
  end if;

  if tg_op = 'INSERT' or new.status is distinct from old.status then
    case new.status
      when 'confirmed' then
        perform public.queue_order_email_notification(new.id, 'order_confirmed', new.id::text || ':status:confirmed', new.status);
      when 'processing' then
        perform public.queue_order_email_notification(new.id, 'order_processing', new.id::text || ':status:processing', new.status);
      when 'shipped' then
        perform public.queue_order_email_notification(new.id, 'order_shipped', new.id::text || ':status:shipped', new.status);
      when 'out_for_delivery' then
        perform public.queue_order_email_notification(new.id, 'order_out_for_delivery', new.id::text || ':status:out_for_delivery', new.status);
      when 'delivered' then
        perform public.queue_order_email_notification(new.id, 'order_delivered', new.id::text || ':status:delivered', new.status);
      when 'cancelled' then
        perform public.queue_order_email_notification(new.id, 'order_cancelled', new.id::text || ':status:cancelled', new.status);
      else
        null;
    end case;
  end if;

  if tg_op = 'UPDATE' and new.payment_status is distinct from old.payment_status then
    perform public.queue_order_email_notification(new.id, 'payment_updated', new.id::text || ':payment:' || new.payment_status, new.payment_status);
  end if;

  return new;
end;
$$;

revoke all on function public.queue_order_email_notification(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.record_order_tracking_change() from public, anon, authenticated;

drop trigger if exists orders_record_tracking_change on public.orders;
create trigger orders_record_tracking_change
after insert or update of status, payment_status on public.orders
for each row execute function public.record_order_tracking_change();

create or replace function public.queue_return_email_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.queue_order_email_notification(
    new.order_id,
    'return_updated',
    new.order_id::text || ':return:' || new.id::text || ':' || new.status,
    new.status
  );
  return new;
end;
$$;

revoke all on function public.queue_return_email_notification() from public, anon, authenticated;

do $$
begin
  if to_regclass('public.order_returns') is not null then
    execute 'drop trigger if exists order_returns_queue_email_notification on public.order_returns';
    execute 'create trigger order_returns_queue_email_notification after insert or update of status on public.order_returns for each row execute function public.queue_return_email_notification()';
  end if;
end;
$$;

create or replace function public.queue_shipment_email_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  order_status text;
begin
  if new.awb_number is null then
    return new;
  end if;

  select orders.status into order_status
  from public.orders
  where orders.id = new.order_id;

  if order_status in ('shipped', 'out_for_delivery', 'delivered')
    and (
      tg_op = 'INSERT'
      or new.awb_number is distinct from old.awb_number
      or new.courier_name is distinct from old.courier_name
      or new.tracking_url is distinct from old.tracking_url
    ) then
    perform public.queue_order_email_notification(
      new.order_id,
      'shipment_details',
      new.order_id::text || ':shipment:' || coalesce(new.awb_number, new.id::text),
      new.awb_number
    );
  end if;

  return new;
end;
$$;

revoke all on function public.queue_shipment_email_notification() from public, anon, authenticated;

do $$
begin
  if to_regclass('public.shipmozo_shipments') is not null then
    execute 'drop trigger if exists shipmozo_shipments_queue_email_notification on public.shipmozo_shipments';
    execute 'create trigger shipmozo_shipments_queue_email_notification after insert or update of awb_number, courier_name, tracking_url on public.shipmozo_shipments for each row execute function public.queue_shipment_email_notification()';
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'order_status_history'
  ) then
    alter publication supabase_realtime add table public.order_status_history;
  end if;
end;
$$;
