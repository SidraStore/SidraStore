do $$
declare
  target_id uuid;
  duplicate_id uuid;
begin
  select id into target_id from public.categories where slug = 'attar-fragrances';
  select id into duplicate_id from public.categories where slug = 'attar-and-fragrances';

  if target_id is not null and duplicate_id is not null then
    update public.subcategories set category_id = target_id where category_id = duplicate_id;
    update public.products set category_id = target_id where category_id = duplicate_id;
    delete from public.categories where id = duplicate_id;
  elsif target_id is null and duplicate_id is not null then
    update public.categories set slug = 'attar-fragrances' where id = duplicate_id;
  end if;

  select id into target_id from public.categories where slug = 'gifts-combos';
  select id into duplicate_id from public.categories where slug = 'gifts-and-combos';

  if target_id is not null and duplicate_id is not null then
    update public.subcategories set category_id = target_id where category_id = duplicate_id;
    update public.products set category_id = target_id where category_id = duplicate_id;
    delete from public.categories where id = duplicate_id;
  elsif target_id is null and duplicate_id is not null then
    update public.categories set slug = 'gifts-combos' where id = duplicate_id;
  end if;
end;
$$;

update public.categories
set image_url = case slug
  when 'attar-fragrances' then '/Products/Attar & Fragrances/attar.jpg'
  when 'islamic-caps' then '/Products/Ismalic Caps/IMG-20230108-WA0009.jpg.jpeg'
  when 'surma' then '/Products/Surma/surma.jpg'
  when 'prayer-essentials' then '/Products/Prayer Essentials/ja-namaz.jpg'
  when 'islamic-wear' then '/Products/Ismalic wear/ajrak-chadar.jpg'
  when 'gifts-combos' then '/Products/Attar & Fragrances/attar.jpg'
  else image_url
end
where slug in ('attar-fragrances', 'islamic-caps', 'surma', 'prayer-essentials', 'islamic-wear', 'gifts-combos');
