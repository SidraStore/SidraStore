-- Keep only the requested premium attar catalog entries.
-- Order items retain their historical product name and price because their product_id is nullable.

delete from public.products
where category_id in (
  select id from public.categories where slug = 'attar-and-fragrances'
)
and slug not in (
  'sabaya',
  'zatax',
  'blue-lady',
  'madina',
  'majmua-special',
  'jannatul-firdaus',
  'rose-bulgari',
  'fasli-gulab',
  'lovely',
  'aseel',
  'sidra-oudh',
  'kashmiri-oudh',
  'istiqbaal'
);
