-- Add the requested premium attars and replace the generic placeholder copy.

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Sidra Oudh', 'sidra-oudh', 'Arabic Oudh Combination', $$A concentrated, alcohol-free perfume oil with a rich Arabic and French blend. Ingredients include amber, agarwood, incense, musk, rose, saffron, caramel, and pimento.

High projection, long lasting, unisex, and an Arabic oud combination.

6ml: ₹249
12ml: ₹349

Free home delivery and easy returns.$$,
  249, 100, '/products/attar-fragrances/sidra-oudh.jpg', 'Best Seller', 4.5, 210, true, true, '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":349,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'oudh'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Sabaya', 'sabaya', 'Long Lasting Premium Attar', $$A non-alcoholic attar with rose, jasmine, citrus, and musk notes anchored in a natural oil base. Long lasting with high projection, premium quality, and a light fragrance.

6ml: ₹249
12ml: ₹399

Free home delivery and easy returns.$$,
  249, 100, '/products/attar-fragrances/rose-bulgari.jpg', null, 4.5, 0, false, true, '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":399,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'floral'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Zatax', 'zatax', 'Citrus Floral Attar', $$A non-alcoholic attar with citrus, floral, spice, and wood notes. Long lasting with high projection, a light fragrance, and a premium perfume character.

6ml: ₹249
12ml: ₹399

Free home delivery and easy returns.$$,
  249, 100, '/products/attar-fragrances/sidra-oudh.jpg', null, 4.5, 0, false, true, '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":399,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'oudh'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Blue Lady', 'blue-lady', 'Orange Blossom Fragrance', $$A non-alcoholic fragrance with orange blossom, tuberose, peach, and sandalwood notes. Long lasting with high projection and a light perfume-type fragrance.

6ml: ₹249
12ml: ₹399

Free home delivery and easy returns.$$,
  249, 100, '/products/attar-fragrances/rose-bulgari.jpg', null, 4.5, 0, false, true, '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":399,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'floral'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Madina', 'madina', 'Light Arabic Fragrance', $$A traditional, alcohol-free concentrated perfume oil blended from natural floral extracts, woods, and resins.

Top notes: saffron, bergamot, green notes, citrus, and white musk.
Heart notes: rose, jasmine, lotus flower, and Arabian jasmine.
Base notes: sandalwood, oud, amber, cedarwood, frankincense, and vetiver.

6ml: ₹249
12ml: ₹399

Long lasting, light Arabic fragrance, high projection, free home delivery, and easy returns.$$,
  249, 100, '/products/attar-fragrances/jannatul-ferdous.jpg', null, 4.5, 0, false, true, '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":399,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'oudh'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Majmua Special', 'majmua-special', 'Traditional Attar', $$Majmua Itr is a famous traditional attar made by blending natural oils such as mitti, khus, kewra, and sandalwood. Its earthy, woody, slightly sweet aroma is long lasting and suitable as an unisex fragrance.

6ml: ₹199
12ml: ₹349

Long lasting, high projection, traditional attar, easy returns, and free home delivery.$$,
  199, 100, '/products/attar-fragrances/attar.jpg', null, 4.5, 0, false, true, '[{"size":"6ml","price":199,"stock":100},{"size":"12ml","price":349,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'oudh'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Jannatul Firdaus', 'jannatul-firdaus', 'Traditional Premium Attar', $$A classic, alcohol-free oriental fragrance oil with a fresh green, herbal, woody, and musky scent profile. Regular traditional attar with heavy projection, long-lasting performance, premium quality, and a unisex character.

6ml: ₹199
12ml: ₹349

Free home delivery.$$,
  199, 100, '/products/attar-fragrances/jannatul-ferdous.jpg', 'Premium', 4.5, 0, false, true, '[{"size":"6ml","price":199,"stock":100},{"size":"12ml","price":349,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'floral'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Rose Bulgari', 'rose-bulgari', 'Light Rose Fragrance', $$Ghulab ki bheeni aur halki mahak with a long-lasting, light rose fragrance, high projection, and premium attar quality.

6ml: ₹249
12ml: ₹399

Free home delivery.$$,
  249, 100, '/products/attar-fragrances/rose-bulgari.jpg', null, 4.5, 140, false, true, '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":399,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'floral'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Fasli Gulab', 'fasli-gulab', 'Traditional Rose Attar', $$Taaze deshi gulab ki pattiyon se taiyar kiya gaya traditional attar with long-lasting performance, high projection, and a fresh rose fragrance.

6ml: ₹249
12ml: ₹399

Free home delivery and easy returns.$$,
  249, 100, '/products/attar-fragrances/fasli-gulab.jpg', null, 4.5, 102, false, true, '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":399,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'floral'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Lovely', 'lovely', 'Light Sweet Fragrance', $$A lightly sweet, enjoyable fragrance with a refreshing feeling after application. It is pleasant without being overly sweet.

6ml: ₹249
12ml: ₹399

Long lasting, light fragrance, high projection, free home delivery, and easy returns.$$,
  249, 100, '/products/attar-fragrances/white-oudh.jpg', null, 4.5, 0, false, true, '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":399,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'floral'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Aseel', 'aseel', 'Light Arabic Fragrance', $$A rich, warm, oriental-floral, alcohol-free perfume oil crafted with botanical distillates, carrier oils, and wood and resin bases.

Top notes: Damask rose, saffron, bergamot, lemon, black pepper, and soft sweet florals.
Middle notes: oud, sandalwood, jasmine, cardamom, and exotic spices.
Base notes: amber, musk, cedar, vanilla, oakmoss, and woody-earthy notes.

6ml: ₹249
12ml: ₹399

Long lasting, light Arabic fragrance, high projection, free home delivery, and easy returns.$$,
  249, 100, '/products/attar-fragrances/aseel.jpg', 'Popular', 4.5, 176, true, true, '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":399,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'oudh'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Kashmiri Oudh', 'kashmiri-oudh', 'Light Oudh Fragrance', $$A citrus-aromatic fragrance with yuzu, black currant, plum, oud, jasmine, rose, Kashmir wood, vanilla, and white musk.

6ml: ₹249
12ml: ₹349

Light oud, long lasting, heavy projection, free home delivery, and easy returns.$$,
  249, 100, '/products/attar-fragrances/jannatul-ferdous.jpg', null, 4.5, 0, false, true, '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":349,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'oudh'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;

insert into public.products (category_id, subcategory_id, name, slug, short_description, description, price, stock_quantity, image_url, badge, rating, review_count, is_featured, is_active, variants)
select categories.id, subcategories.id, 'Istiqbaal', 'istiqbaal', 'French Fragrance Attar', $$A fruity, long-lasting attar with a distinctive sweetness. Non-alcoholic premium fragrance with a French fragrance character.

6ml: ₹249
12ml: ₹399

Free home delivery.$$,
  249, 100, '/products/attar-fragrances/sidra-oudh.jpg', null, 4.5, 0, false, true, '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":399,"stock":50}]'::jsonb
from public.categories categories
join public.subcategories subcategories on subcategories.category_id = categories.id and subcategories.slug = 'oudh'
where categories.slug = 'attar-and-fragrances'
on conflict (slug) do update set short_description = excluded.short_description, description = excluded.description, price = excluded.price, image_url = excluded.image_url, variants = excluded.variants, is_active = true;
