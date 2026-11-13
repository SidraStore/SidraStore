-- Customer returns for delivered orders within the seven-day return window.

alter table public.orders
  add column if not exists delivered_at timestamptz;

-- Recover delivery timestamps already known by Shipmozo, then use the order update
-- timestamp for older manually delivered orders that have no carrier timestamp.
do $$
begin
  if to_regclass('public.shipmozo_shipments') is not null then
    execute $sql$
      update public.orders
      set delivered_at = shipments.delivered_at
      from public.shipmozo_shipments as shipments
      where shipments.order_id = public.orders.id
        and public.orders.status = 'delivered'
        and public.orders.delivered_at is null
        and shipments.delivered_at is not null
    $sql$;
  end if;
end;
$$;

update public.orders
set delivered_at = updated_at
where status = 'delivered'
  and delivered_at is null;

create or replace function public.set_order_delivered_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'delivered'
    and new.delivered_at is null then
    if tg_op = 'INSERT' then
      new.delivered_at := now();
    elsif old.status is distinct from 'delivered' then
      new.delivered_at := now();
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.set_order_delivered_at() from public;

drop trigger if exists orders_set_delivered_at on public.orders;
create trigger orders_set_delivered_at
before insert or update of status on public.orders
for each row execute function public.set_order_delivered_at();

create table if not exists public.order_returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  customer_email text not null,
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'rejected', 'picked_up', 'refunded')),
  reason text not null check (char_length(reason) between 5 and 500),
  image_url text check (image_url is null or image_url ~ '^https://'),
  admin_note text check (admin_note is null or char_length(admin_note) <= 500),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  picked_up_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_returns_status_requested_idx
  on public.order_returns(status, requested_at desc);
create index if not exists order_returns_customer_idx
  on public.order_returns(customer_id, requested_at desc);

drop trigger if exists order_returns_set_updated_at on public.order_returns;
create trigger order_returns_set_updated_at
before update on public.order_returns
for each row execute function public.set_updated_at();

alter table public.order_returns enable row level security;
alter table public.order_returns replica identity full;
revoke all on table public.order_returns from anon, authenticated;
grant select on table public.order_returns to authenticated;

drop policy if exists "Customers read own order returns" on public.order_returns;
create policy "Customers read own order returns"
on public.order_returns for select to authenticated
using (
  exists (
    select 1
    from public.orders
    join public.customers on customers.id = orders.customer_id
    where orders.id = order_returns.order_id
      and customers.auth_user_id = auth.uid()
  )
);

create or replace function public.request_order_return(
  p_order_id uuid,
  p_reason text,
  p_image_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_order public.orders%rowtype;
  existing_return public.order_returns%rowtype;
  created_return public.order_returns%rowtype;
  normalized_reason text := regexp_replace(trim(coalesce(p_reason, '')), '[[:space:]]+', ' ', 'g');
  normalized_image_url text := nullif(trim(coalesce(p_image_url, '')), '');
  delivery_timestamp timestamptz;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if p_order_id is null then
    raise exception 'An order is required.';
  end if;

  if char_length(normalized_reason) < 5 or char_length(normalized_reason) > 500 then
    raise exception 'Please provide a return reason between 5 and 500 characters.';
  end if;

  if normalized_image_url is not null
    and (char_length(normalized_image_url) > 2048 or normalized_image_url !~ '^https://') then
    raise exception 'The return image URL is invalid.';
  end if;

  select * into current_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order was not found.';
  end if;

  if not exists (
    select 1
    from public.customers
    where customers.id = current_order.customer_id
      and customers.auth_user_id = current_user_id
  ) then
    raise exception 'You can only request a return for your own order.';
  end if;

  if current_order.status <> 'delivered' then
    raise exception 'Returns are available only after an order is delivered.';
  end if;

  delivery_timestamp := coalesce(current_order.delivered_at, current_order.updated_at);
  if delivery_timestamp is null or clock_timestamp() > delivery_timestamp + interval '7 days' then
    raise exception 'The seven-day return window for this order has closed.';
  end if;

  select * into existing_return
  from public.order_returns
  where order_id = current_order.id
  for update;

  if found then
    raise exception 'A return request already exists for this order.';
  end if;

  insert into public.order_returns (
    order_id,
    customer_id,
    customer_email,
    reason,
    image_url
  ) values (
    current_order.id,
    current_order.customer_id,
    current_order.customer_email,
    normalized_reason,
    normalized_image_url
  )
  returning * into created_return;

  return to_jsonb(created_return);
end;
$$;

revoke all on function public.request_order_return(uuid, text, text) from public;
grant execute on function public.request_order_return(uuid, text, text) to authenticated;

create or replace function public.admin_update_order_return(
  p_return_id uuid,
  p_status text,
  p_admin_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_return public.order_returns%rowtype;
  current_order public.orders%rowtype;
  updated_return public.order_returns%rowtype;
  update_timestamp timestamptz := now();
begin
  if p_return_id is null then
    raise exception 'A return request is required.';
  end if;

  if p_status is null or p_status not in ('requested', 'approved', 'rejected', 'picked_up', 'refunded') then
    raise exception 'Invalid return status.';
  end if;

  if p_admin_note is not null and char_length(trim(p_admin_note)) > 500 then
    raise exception 'Admin notes must be 500 characters or fewer.';
  end if;

  select * into current_return
  from public.order_returns
  where id = p_return_id
  for update;

  if not found then
    raise exception 'Return request was not found.';
  end if;

  if not (
    (current_return.status = 'requested' and p_status in ('requested', 'approved', 'rejected'))
    or (current_return.status = 'approved' and p_status in ('approved', 'picked_up'))
    or (current_return.status = 'rejected' and p_status = 'rejected')
    or (current_return.status = 'picked_up' and p_status in ('picked_up', 'refunded'))
    or (current_return.status = 'refunded' and p_status = 'refunded')
  ) then
    raise exception 'This return cannot move from % to %.', current_return.status, p_status;
  end if;

  select * into current_order
  from public.orders
  where id = current_return.order_id
  for update;

  if p_status = 'refunded'
    and current_order.payment_method = 'razorpay'
    and current_order.payment_status = 'paid' then
    update public.orders
    set payment_status = 'refunded', updated_at = update_timestamp
    where id = current_order.id;
  end if;

  update public.order_returns
  set status = p_status,
      admin_note = nullif(trim(coalesce(p_admin_note, '')), ''),
      approved_at = case when p_status = 'approved' and approved_at is null then update_timestamp else approved_at end,
      rejected_at = case when p_status = 'rejected' and rejected_at is null then update_timestamp else rejected_at end,
      picked_up_at = case when p_status = 'picked_up' and picked_up_at is null then update_timestamp else picked_up_at end,
      refunded_at = case when p_status = 'refunded' and refunded_at is null then update_timestamp else refunded_at end,
      updated_at = update_timestamp
  where id = current_return.id
  returning * into updated_return;

  return to_jsonb(updated_return);
end;
$$;

revoke all on function public.admin_update_order_return(uuid, text, text) from public, anon, authenticated;
grant execute on function public.admin_update_order_return(uuid, text, text) to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'order_returns'
  ) then
    alter publication supabase_realtime add table public.order_returns;
  end if;
end;
$$;
