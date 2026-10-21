-- Repeatable demo commerce records for validating the Sidra Store admin panel.
-- These profiles are not Supabase Auth accounts and cannot sign in.

insert into public.customers (id, auth_user_id, full_name, email, phone)
values
  ('10000000-0000-4000-8000-000000000001', null, 'Aarav Khan', 'aarav.demo@example.com', '+91 90000 10001'),
  ('10000000-0000-4000-8000-000000000002', null, 'Sara Ali', 'sara.demo@example.com', '+91 90000 10002')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone,
  updated_at = now();

insert into public.orders (
  id, order_number, customer_id, customer_email, shipping_address, status,
  payment_status, payment_method, subtotal, shipping_amount, total, created_at
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'SIDRA-DEMO-1001',
    '10000000-0000-4000-8000-000000000001',
    'aarav.demo@example.com',
    '{"recipient_name":"Aarav Khan","phone":"+91 90000 10001","address_line_1":"12 Noor Residency","address_line_2":"Near Central Market","city":"Jabalpur","state":"Madhya Pradesh","postal_code":"482001","country":"India"}'::jsonb,
    'processing', 'paid', 'upi', 998, 90, 1088, now() - interval '2 days'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'SIDRA-DEMO-1002',
    '10000000-0000-4000-8000-000000000002',
    'sara.demo@example.com',
    '{"recipient_name":"Sara Ali","phone":"+91 90000 10002","address_line_1":"44 Heritage Lane","address_line_2":"Hussainiya School Road","city":"Jabalpur","state":"Madhya Pradesh","postal_code":"482003","country":"India"}'::jsonb,
    'confirmed', 'pending', 'cod', 1198, 0, 1198, now() - interval '1 day'
  )
on conflict (id) do update set
  customer_id = excluded.customer_id,
  customer_email = excluded.customer_email,
  shipping_address = excluded.shipping_address,
  status = excluded.status,
  payment_status = excluded.payment_status,
  payment_method = excluded.payment_method,
  subtotal = excluded.subtotal,
  shipping_amount = excluded.shipping_amount,
  total = excluded.total,
  updated_at = now();

insert into public.order_items (id, order_id, product_id, product_name, unit_price, quantity, line_total)
select
  '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  products.id,
  products.name,
  499,
  2,
  998
from public.products
where products.slug = 'sidra-oudh'
on conflict (id) do update set
  product_id = excluded.product_id,
  product_name = excluded.product_name,
  unit_price = excluded.unit_price,
  quantity = excluded.quantity,
  line_total = excluded.line_total;

insert into public.order_items (id, order_id, product_id, product_name, unit_price, quantity, line_total)
select
  '30000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000002',
  products.id,
  products.name,
  499,
  1,
  499
from public.products
where products.slug = 'aseel'
on conflict (id) do update set
  product_id = excluded.product_id,
  product_name = excluded.product_name,
  unit_price = excluded.unit_price,
  quantity = excluded.quantity,
  line_total = excluded.line_total;

insert into public.order_items (id, order_id, product_id, product_name, unit_price, quantity, line_total)
select
  '30000000-0000-4000-8000-000000000003',
  '20000000-0000-4000-8000-000000000002',
  products.id,
  products.name,
  699,
  1,
  699
from public.products
where products.slug = 'white-oudh'
on conflict (id) do update set
  product_id = excluded.product_id,
  product_name = excluded.product_name,
  unit_price = excluded.unit_price,
  quantity = excluded.quantity,
  line_total = excluded.line_total;
