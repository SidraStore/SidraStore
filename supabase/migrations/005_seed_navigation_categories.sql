insert into public.categories (name, slug, sort_order)
values
  ('Attar & Fragrances', 'attar-fragrances', 1),
  ('Islamic Caps', 'islamic-caps', 2),
  ('Surma', 'surma', 3),
  ('Prayer Essentials', 'prayer-essentials', 4),
  ('Islamic Wear', 'islamic-wear', 5),
  ('Gifts & Combos', 'gifts-combos', 6)
on conflict (slug) do update
set name = excluded.name, sort_order = excluded.sort_order, is_active = true;

insert into public.subcategories (category_id, name, slug, sort_order)
select categories.id, seeds.name, seeds.slug, seeds.sort_order
from (
  values
    ('attar-fragrances', 'Sidra Oudh', 'sidra-oudh', 1),
    ('attar-fragrances', 'Aseel', 'aseel', 2),
    ('attar-fragrances', 'White Oudh', 'white-oudh', 3),
    ('attar-fragrances', 'Jannatul Ferdous', 'jannatul-ferdous', 4),
    ('attar-fragrances', 'Rose Bulgari', 'rose-bulgari', 5),
    ('attar-fragrances', 'Fasli Gulab', 'fasli-gulab', 6),
    ('islamic-caps', 'Barkati Cap', 'barkati-cap', 1),
    ('islamic-caps', 'Owaisi Cap', 'owaisi-cap', 2),
    ('islamic-caps', 'Omani Cap', 'omani-cap', 3),
    ('islamic-caps', 'Jarkali Cap', 'jarkali-cap', 4),
    ('islamic-caps', 'Designer Cap', 'designer-cap', 5),
    ('prayer-essentials', 'Ja Namaz', 'ja-namaz', 1),
    ('prayer-essentials', 'Surma', 'surma', 2),
    ('prayer-essentials', 'Attar for Prayer', 'attar-for-prayer', 3),
    ('islamic-wear', 'Ajrak Chadar', 'ajrak-chadar', 1),
    ('islamic-wear', 'Omani Chadar', 'omani-chadar', 2),
    ('islamic-wear', 'Imama Shareef', 'imama-shareef', 3),
    ('gifts-combos', 'Attar Gift Sets', 'attar-gift-sets', 1),
    ('gifts-combos', 'Premium Combo Boxes', 'premium-combo-boxes', 2)
) as seeds(category_slug, name, slug, sort_order)
join public.categories on categories.slug = seeds.category_slug
on conflict (category_id, slug) do update
set name = excluded.name, sort_order = excluded.sort_order, is_active = true;

