-- Customer order cancellation with atomic inventory restoration.

alter table public.orders
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text,
  add column if not exists stock_restored_at timestamptz;

create index if not exists orders_cancelled_at_idx
on public.orders(cancelled_at desc)
where cancelled_at is not null;

create or replace function public.cancel_order(p_order_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_order public.orders%rowtype;
  normalized_reason text := regexp_replace(trim(coalesce(p_reason, '')), '[[:space:]]+', ' ', 'g');
  item record;
  affected_product record;
  variant_exists boolean;
  shipment_in_flight boolean;
begin
  if p_order_id is null then
    raise exception 'An order is required.';
  end if;

  if length(normalized_reason) < 5 or length(normalized_reason) > 500 then
    raise exception 'Please provide a cancellation reason between 5 and 500 characters.';
  end if;

  select * into current_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order was not found.';
  end if;

  -- Authenticated callers may only cancel orders linked to their own account.
  -- The service role is used by the existing admin API and has no auth.uid().
  if current_user_id is not null and not exists (
    select 1
    from public.customers
    where customers.id = current_order.customer_id
      and customers.auth_user_id = current_user_id
  ) then
    raise exception 'You can only cancel your own orders.';
  end if;

  if current_order.status = 'cancelled' then
    return jsonb_build_object(
      'id', current_order.id,
      'status', current_order.status,
      'cancelled_at', current_order.cancelled_at,
      'cancellation_reason', current_order.cancellation_reason,
      'stock_restored_at', current_order.stock_restored_at,
      'updated_at', current_order.updated_at,
      'payment_status', current_order.payment_status
    );
  end if;

  if current_order.status not in ('pending', 'confirmed', 'processing') then
    raise exception 'This order can no longer be cancelled.';
  end if;

  -- Shipmozo is installed through a separate setup query in this project.
  -- Keep cancellation runnable before that optional tracking schema exists.
  if to_regclass('public.shipmozo_shipments') is not null then
    execute 'select exists (select 1 from public.shipmozo_shipments where order_id = $1 and status in (''pushed'', ''assigned'', ''pickup_scheduled''))'
      into shipment_in_flight
      using current_order.id;
    if shipment_in_flight then
      raise exception 'This order is already with the courier and can no longer be cancelled.';
    end if;
  end if;

  -- Lock all referenced products in a stable order before changing inventory.
  -- This keeps concurrent checkout/cancellation operations from racing.
  perform products.id
  from public.products
  join public.order_items on order_items.product_id = products.id
  where order_items.order_id = current_order.id
  order by products.id
  for update;

  for item in
    select
      order_items.product_id,
      order_items.variant_label,
      sum(order_items.quantity)::integer as quantity
    from public.order_items
    where order_items.order_id = current_order.id
      and order_items.product_id is not null
    group by order_items.product_id, order_items.variant_label
  loop
    if item.variant_label is null then
      update public.products
      set stock_quantity = stock_quantity + item.quantity
      where id = item.product_id;
    else
      select exists (
        select 1
        from public.products,
        jsonb_array_elements(products.variants) as variant(value)
        where products.id = item.product_id
          and variant.value ->> 'size' = item.variant_label
      ) into variant_exists;

      if not variant_exists then
        raise exception 'The ordered product variant could not be found, so inventory was not changed.';
      end if;

      update public.products
      set variants = (
        select jsonb_agg(
          case
            when variant.value ->> 'size' = item.variant_label then jsonb_set(
              variant.value,
              '{stock}',
              to_jsonb(coalesce((variant.value ->> 'stock')::integer, 0) + item.quantity)
            )
            else variant.value
          end
          order by variant.ordinality
        )
        from jsonb_array_elements(products.variants) with ordinality as variant(value, ordinality)
      )
      where id = item.product_id;
    end if;
  end loop;

  -- Keep the aggregate stock column in sync for products whose variants changed.
  for affected_product in
    select distinct order_items.product_id
    from public.order_items
    where order_items.order_id = current_order.id
      and order_items.product_id is not null
      and order_items.variant_label is not null
  loop
    update public.products
    set stock_quantity = coalesce((
      select sum((variant.value ->> 'stock')::integer)::integer
      from jsonb_array_elements(products.variants) as variant(value)
    ), 0)
    where id = affected_product.product_id;
  end loop;

  update public.orders
  set
    status = 'cancelled',
    cancelled_at = now(),
    cancellation_reason = normalized_reason,
    stock_restored_at = now(),
    updated_at = now()
  where id = current_order.id;

  return jsonb_build_object(
    'id', current_order.id,
    'status', 'cancelled',
    'cancelled_at', (select cancelled_at from public.orders where id = current_order.id),
    'cancellation_reason', normalized_reason,
    'stock_restored_at', (select stock_restored_at from public.orders where id = current_order.id),
    'updated_at', (select updated_at from public.orders where id = current_order.id),
    'payment_status', current_order.payment_status
  );
end;
$$;

revoke all on function public.cancel_order(uuid, text) from public;
grant execute on function public.cancel_order(uuid, text) to authenticated, service_role;

-- The customer dashboard already subscribes to order changes. Ensure the table
-- is in the Supabase Realtime publication in installations where it was not added.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end;
$$;
