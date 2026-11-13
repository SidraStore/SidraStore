-- Database-owned inventory status for atomic checkout stock mutations.
-- stock_quantity remains the canonical available quantity for simple products
-- and the aggregate quantity for products with variants.

alter table public.products
  add column if not exists inventory_status text;

-- Repair aggregate quantities for existing variant products before deriving the
-- availability state. Simple products keep their existing stock_quantity.
update public.products as product
set stock_quantity = coalesce((
  select sum(
    case
      when variant.value ->> 'stock' ~ '^[0-9]+$'
        then (variant.value ->> 'stock')::integer
      else 0
    end
  )::integer
  from jsonb_array_elements(product.variants) as variant(value)
), 0)
where jsonb_typeof(coalesce(product.variants, '[]'::jsonb)) = 'array'
  and jsonb_array_length(coalesce(product.variants, '[]'::jsonb)) > 0;

update public.products
set inventory_status = case
  when stock_quantity > 0 then 'in_stock'
  else 'out_of_stock'
end
where inventory_status is null;

alter table public.products
  alter column inventory_status set default 'in_stock',
  alter column inventory_status set not null;

alter table public.products
  drop constraint if exists products_inventory_status_check;

alter table public.products
  add constraint products_inventory_status_check
  check (inventory_status in ('in_stock', 'out_of_stock'));

create index if not exists products_storefront_inventory_idx
  on public.products(is_active, inventory_status, stock_quantity);

comment on column public.products.inventory_status is
  'Database-maintained availability state derived from stock_quantity. Admins change simple stock_quantity or variant stock entries; this field is not user-controlled.';

create or replace function public.sync_product_inventory_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if jsonb_typeof(coalesce(new.variants, '[]'::jsonb)) = 'array'
    and jsonb_array_length(coalesce(new.variants, '[]'::jsonb)) > 0 then
    new.stock_quantity := coalesce((
      select sum(
        case
          when variant.value ->> 'stock' ~ '^[0-9]+$'
            then (variant.value ->> 'stock')::integer
          else 0
        end
      )::integer
      from jsonb_array_elements(new.variants) as variant(value)
    ), 0);
  end if;

  if new.stock_quantity is null or new.stock_quantity < 0 then
    raise exception 'Product stock quantity must be a non-negative whole number.';
  end if;

  new.inventory_status := case
    when new.stock_quantity > 0 then 'in_stock'
    else 'out_of_stock'
  end;

  return new;
end;
$$;

revoke all on function public.sync_product_inventory_status() from public;

drop trigger if exists products_sync_inventory_status on public.products;
create trigger products_sync_inventory_status
before insert or update of inventory_status, stock_quantity, variants on public.products
for each row execute function public.sync_product_inventory_status();

-- Product rows are published so customer storefronts can refresh immediately
-- after an order, cancellation, or admin stock edit. The polling fallback in
-- the app still covers temporarily disconnected clients.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;
end;
$$;
