-- Split combined Attar records without changing their existing commercial data.
-- The source row keeps its image, price, stock, variants, ratings, and history.

begin;

do $$
declare
  source_record public.products%rowtype;
  attar_category_id uuid;
  floral_subcategory_id uuid;
  oudh_subcategory_id uuid;
begin
  select id into attar_category_id
  from public.categories
  where slug = 'attar-and-fragrances';

  select id into floral_subcategory_id
  from public.subcategories
  where category_id = attar_category_id and slug = 'floral';

  select id into oudh_subcategory_id
  from public.subcategories
  where category_id = attar_category_id and slug = 'oudh';

  if attar_category_id is null or floral_subcategory_id is null or oudh_subcategory_id is null then
    raise exception 'Attar category structure is incomplete.';
  end if;

  select * into source_record
  from public.products
  where slug = 'mogra-magnet' and category_id = attar_category_id
  for update;

  if source_record.id is not null then
    if not exists (select 1 from public.products where slug = 'mogra') then
      update public.products
      set name = 'Mogra',
          slug = 'mogra',
          subcategory_id = floral_subcategory_id,
          short_description = replace(source_record.short_description, 'Mogra Magnet', 'Mogra'),
          description = replace(source_record.description, 'Mogra Magnet', 'Mogra')
      where id = source_record.id;
    else
      update public.products set is_active = false where id = source_record.id;
    end if;

    insert into public.products (
      category_id, subcategory_id, name, slug, short_description, description,
      price, compare_at_price, stock_quantity, image_url, gallery_urls, badge,
      rating, review_count, is_featured, is_active, variants, created_at
    )
    select
      source_record.category_id,
      floral_subcategory_id,
      'Magnet',
      'magnet',
      replace(source_record.short_description, 'Mogra Magnet', 'Magnet'),
      replace(source_record.description, 'Mogra Magnet', 'Magnet'),
      source_record.price,
      source_record.compare_at_price,
      source_record.stock_quantity,
      source_record.image_url,
      source_record.gallery_urls,
      source_record.badge,
      source_record.rating,
      source_record.review_count,
      source_record.is_featured,
      source_record.is_active,
      source_record.variants,
      source_record.created_at
    where not exists (select 1 from public.products where slug = 'magnet');
  end if;

  insert into public.products (
    category_id, subcategory_id, name, slug, short_description, description,
    price, stock_quantity, image_url, variants, is_active
  )
  select
    attar_category_id,
    floral_subcategory_id,
    'Mogra',
    'mogra',
    'Premium Alcohol-Free Attar',
    'Mogra is a long-lasting, alcohol-free premium attar with high projection.' || E'\n\n6ml: ₹199\n12ml: ₹349\n\nFree home delivery.',
    199,
    100,
    'https://ik.imagekit.io/w9zavcqhb/sidra-store/products/attars/mogra-magnet.png',
    '[{"size":"6ml","price":199,"stock":100},{"size":"12ml","price":349,"stock":50}]'::jsonb,
    true
  where not exists (select 1 from public.products where slug = 'mogra');

  insert into public.products (
    category_id, subcategory_id, name, slug, short_description, description,
    price, stock_quantity, image_url, variants, is_active
  )
  select
    attar_category_id,
    floral_subcategory_id,
    'Magnet',
    'magnet',
    'Premium Alcohol-Free Attar',
    'Magnet is a long-lasting, alcohol-free premium attar with high projection.' || E'\n\n6ml: ₹199\n12ml: ₹349\n\nFree home delivery.',
    199,
    100,
    'https://ik.imagekit.io/w9zavcqhb/sidra-store/products/attars/mogra-magnet.png',
    '[{"size":"6ml","price":199,"stock":100},{"size":"12ml","price":349,"stock":50}]'::jsonb,
    true
  where not exists (select 1 from public.products where slug = 'magnet');

  select * into source_record
  from public.products
  where slug = 'hina-mizyan' and category_id = attar_category_id
  for update;

  if source_record.id is not null then
    if not exists (select 1 from public.products where slug = 'hina') then
      update public.products
      set name = 'Hina',
          slug = 'hina',
          subcategory_id = oudh_subcategory_id,
          short_description = replace(source_record.short_description, 'Hina Mizyan', 'Hina'),
          description = replace(source_record.description, 'Hina Mizyan', 'Hina')
      where id = source_record.id;
    else
      update public.products set is_active = false where id = source_record.id;
    end if;

    insert into public.products (
      category_id, subcategory_id, name, slug, short_description, description,
      price, compare_at_price, stock_quantity, image_url, gallery_urls, badge,
      rating, review_count, is_featured, is_active, variants, created_at
    )
    select
      source_record.category_id,
      oudh_subcategory_id,
      'Mizyan',
      'mizyan',
      replace(source_record.short_description, 'Hina Mizyan', 'Mizyan'),
      replace(source_record.description, 'Hina Mizyan', 'Mizyan'),
      source_record.price,
      source_record.compare_at_price,
      source_record.stock_quantity,
      source_record.image_url,
      source_record.gallery_urls,
      source_record.badge,
      source_record.rating,
      source_record.review_count,
      source_record.is_featured,
      source_record.is_active,
      source_record.variants,
      source_record.created_at
    where not exists (select 1 from public.products where slug = 'mizyan');
  end if;

  insert into public.products (
    category_id, subcategory_id, name, slug, short_description, description,
    price, stock_quantity, image_url, variants, is_active
  )
  select
    attar_category_id,
    oudh_subcategory_id,
    'Hina',
    'hina',
    'Premium Alcohol-Free Attar',
    'Hina is a long-lasting, alcohol-free premium attar with high projection.' || E'\n\n6ml: ₹199\n12ml: ₹349\n\nFree home delivery.',
    199,
    100,
    'https://ik.imagekit.io/w9zavcqhb/sidra-store/products/attars/hina-mizyan.png',
    '[{"size":"6ml","price":199,"stock":100},{"size":"12ml","price":349,"stock":50}]'::jsonb,
    true
  where not exists (select 1 from public.products where slug = 'hina');

  insert into public.products (
    category_id, subcategory_id, name, slug, short_description, description,
    price, stock_quantity, image_url, variants, is_active
  )
  select
    attar_category_id,
    oudh_subcategory_id,
    'Mizyan',
    'mizyan',
    'Premium Alcohol-Free Attar',
    'Mizyan is a long-lasting, alcohol-free premium attar with high projection.' || E'\n\n6ml: ₹199\n12ml: ₹349\n\nFree home delivery.',
    199,
    100,
    'https://ik.imagekit.io/w9zavcqhb/sidra-store/products/attars/hina-mizyan.png',
    '[{"size":"6ml","price":199,"stock":100},{"size":"12ml","price":349,"stock":50}]'::jsonb,
    true
  where not exists (select 1 from public.products where slug = 'mizyan');

  update public.products
  set short_description = 'Thick, creamy, alcohol-free white musk attar',
      description = $musk$Musk Tahara is a traditional, thick, creamy, alcohol-free white musk perfume and personal hygiene oil. It features a beautiful blend of synthetic white musk accords, clean floral notes, and a smooth carrier oil or lotion base.

Fragrance Notes:
- Floral & Sweet Notes: White flowers, lotus blossom, white lily, rose, and iris.
- Warm & Powdery Accents: Vanilla, tonka bean, honey, amber, and soft woody or cashmere notes.

Product Characteristics:
- Fragrance Type: White Musk
- Texture: Thick and creamy
- Alcohol Content: Alcohol-free
- Fragrance Profile: Floral, sweet, warm, and powdery
- Product Type: Attar / Perfume Oil$musk$
  where slug = 'musk-tahara' and category_id = attar_category_id;

  insert into public.products (
    category_id, subcategory_id, name, slug, short_description, description,
    price, stock_quantity, image_url, variants, is_active
  )
  select
    attar_category_id,
    (select id from public.subcategories where category_id = attar_category_id and slug = 'musk'),
    'Musk Tahara',
    'musk-tahara',
    'Thick, creamy, alcohol-free white musk attar',
    $musk$Musk Tahara is a traditional, thick, creamy, alcohol-free white musk perfume and personal hygiene oil. It features a beautiful blend of synthetic white musk accords, clean floral notes, and a smooth carrier oil or lotion base.

Fragrance Notes:
- Floral & Sweet Notes: White flowers, lotus blossom, white lily, rose, and iris.
- Warm & Powdery Accents: Vanilla, tonka bean, honey, amber, and soft woody or cashmere notes.

Product Characteristics:
- Fragrance Type: White Musk
- Texture: Thick and creamy
- Alcohol Content: Alcohol-free
- Fragrance Profile: Floral, sweet, warm, and powdery
- Product Type: Attar / Perfume Oil$musk$,
    249,
    100,
    'https://ik.imagekit.io/w9zavcqhb/sidra-store/products/attars/musk-tahara.png',
    '[{"size":"6ml","price":249,"stock":100},{"size":"12ml","price":399,"stock":50}]'::jsonb,
    true
  where not exists (select 1 from public.products where slug = 'musk-tahara');
end;
$$;

commit;
