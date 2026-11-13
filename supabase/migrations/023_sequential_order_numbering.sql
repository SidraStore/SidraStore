-- Replace timestamp/UUID-style display numbers with database-owned sequential numbers.
-- Existing order UUIDs remain unchanged, and their previous display values are retained.

alter table public.orders
  add column if not exists order_sequence bigint,
  add column if not exists legacy_order_number text;

create sequence if not exists public.orders_order_number_seq;

-- Preserve every existing display value before assigning its stable sequential value.
update public.orders
set legacy_order_number = coalesce(legacy_order_number, order_number)
where legacy_order_number is null;

with numbered_orders as (
  select
    id,
    row_number() over (order by created_at asc, id asc)::bigint as sequence_number
  from public.orders
  where order_sequence is null
)
update public.orders
set order_sequence = numbered_orders.sequence_number
from numbered_orders
where public.orders.id = numbered_orders.id;

-- Use temporary unique values so the existing order_number unique constraint cannot
-- collide while old values are replaced in one transaction.
update public.orders
set order_number = 'SIDRA-LEGACY-' || id::text;

update public.orders
set order_number = 'SIDRA-' || lpad(order_sequence::text, 2, '0');

alter table public.orders
  alter column order_sequence set not null;

create unique index if not exists orders_order_sequence_uidx
  on public.orders(order_sequence);

do $$
declare
  highest_order_sequence bigint;
begin
  select coalesce(max(order_sequence), 0)
  into highest_order_sequence
  from public.orders;

  perform setval(
    'public.orders_order_number_seq'::regclass,
    greatest(highest_order_sequence, 1),
    highest_order_sequence > 0
  );
end;
$$;

-- Payment attempts return this value after Razorpay finalization. Keep them aligned
-- with the migrated order number instead of returning the legacy display value.
do $$
begin
  if to_regclass('public.payment_attempts') is not null then
    execute $sql$
      update public.payment_attempts as attempts
      set order_number = orders.order_number
      from public.orders
      where attempts.order_number = orders.legacy_order_number
    $sql$;
  end if;
end;
$$;

create or replace function public.allocate_order_number()
returns text
language sql
security definer
set search_path = ''
as $$
  select 'SIDRA-' || lpad(nextval('public.orders_order_number_seq')::text, 2, '0');
$$;

revoke all on function public.allocate_order_number() from public;

create or replace function public.assign_sequential_order_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parsed_order_sequence bigint;
begin
  -- The database owns allocation for every insert, including direct/API inserts.
  new.legacy_order_number := coalesce(new.legacy_order_number, new.order_number);
  new.order_number := public.allocate_order_number();
  parsed_order_sequence := substring(new.order_number from '^SIDRA-([0-9]+)$')::bigint;

  new.order_sequence := parsed_order_sequence;
  return new;
end;
$$;

revoke all on function public.assign_sequential_order_number() from public;

drop trigger if exists orders_assign_sequential_order_number on public.orders;
create trigger orders_assign_sequential_order_number
before insert on public.orders
for each row execute function public.assign_sequential_order_number();

-- Existing installations may already have the full checkout helper from
-- queries/razorpay-setup.sql. Wrap it so its public return value matches the
-- number assigned by the insert trigger without duplicating checkout logic.
do $$
begin
  if to_regprocedure('public.create_customer_order_for_user(uuid,uuid,text,text,text,text)') is not null
     and to_regprocedure('public.create_customer_order_for_user_legacy_023(uuid,uuid,text,text,text,text)') is null then
    execute 'alter function public.create_customer_order_for_user(uuid,uuid,text,text,text,text) rename to create_customer_order_for_user_legacy_023';
  end if;

  if to_regprocedure('public.place_customer_order(uuid)') is not null
     and to_regprocedure('public.place_customer_order_legacy_023(uuid)') is null then
    execute 'alter function public.place_customer_order(uuid) rename to place_customer_order_legacy_023';
  end if;

  if to_regprocedure('public.place_guest_order(text,text,text,jsonb,jsonb,text,text,text,text)') is not null
     and to_regprocedure('public.place_guest_order_legacy_023(text,text,text,jsonb,jsonb,text,text,text,text)') is null then
    execute 'alter function public.place_guest_order(text,text,text,jsonb,jsonb,text,text,text,text) rename to place_guest_order_legacy_023';
  end if;
end;
$$;

create or replace function public.create_customer_order_for_user(
  p_auth_user_id uuid,
  p_address_id uuid,
  p_payment_method text,
  p_payment_status text,
  p_razorpay_order_id text default null,
  p_razorpay_payment_id text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  submitted_order_number text;
  assigned_order_number text;
begin
  submitted_order_number := public.create_customer_order_for_user_legacy_023(
    p_auth_user_id,
    p_address_id,
    p_payment_method,
    p_payment_status,
    p_razorpay_order_id,
    p_razorpay_payment_id
  );

  select orders.order_number
  into assigned_order_number
  from public.orders
  where orders.legacy_order_number = submitted_order_number
  order by orders.created_at desc, orders.id desc
  limit 1;

  return coalesce(assigned_order_number, submitted_order_number);
end;
$$;

create or replace function public.place_customer_order(p_address_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  submitted_order_number text;
  assigned_order_number text;
begin
  submitted_order_number := public.place_customer_order_legacy_023(p_address_id);

  select orders.order_number
  into assigned_order_number
  from public.orders
  where orders.legacy_order_number = submitted_order_number
  order by orders.created_at desc, orders.id desc
  limit 1;

  return coalesce(assigned_order_number, submitted_order_number);
end;
$$;

create or replace function public.place_guest_order(
  p_full_name text,
  p_email text,
  p_phone text,
  p_address jsonb,
  p_items jsonb,
  p_payment_method text default 'cod',
  p_payment_status text default 'pending',
  p_razorpay_order_id text default null,
  p_razorpay_payment_id text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  submitted_order_number text;
  assigned_order_number text;
begin
  submitted_order_number := public.place_guest_order_legacy_023(
    p_full_name,
    p_email,
    p_phone,
    p_address,
    p_items,
    p_payment_method,
    p_payment_status,
    p_razorpay_order_id,
    p_razorpay_payment_id
  );

  select orders.order_number
  into assigned_order_number
  from public.orders
  where orders.legacy_order_number = submitted_order_number
  order by orders.created_at desc, orders.id desc
  limit 1;

  return coalesce(assigned_order_number, submitted_order_number);
end;
$$;

revoke all on function public.create_customer_order_for_user(uuid,uuid,text,text,text,text) from public;
revoke all on function public.place_customer_order(uuid) from public;
revoke all on function public.place_guest_order(text,text,text,jsonb,jsonb,text,text,text,text) from public;
grant execute on function public.place_customer_order(uuid) to authenticated;
grant execute on function public.place_guest_order(text,text,text,jsonb,jsonb,text,text,text,text) to service_role;
