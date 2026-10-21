update public.categories set
  image_url = case slug
    when 'attar-fragrances' then '/products/Attar & Fragrances/attar.jpg'
    when 'islamic-caps' then '/products/Ismalic Caps/IMG-20230108-WA0009.jpg.jpeg'
    when 'surma' then '/products/surma/surma.jpg'
    when 'prayer-essentials' then '/products/Prayer Essentials/ja-namaz.jpg'
    when 'islamic-wear' then '/products/Ismalic wear/ajrak-chadar.jpg'
    when 'gifts-combos' then '/products/Attar & Fragrances/attar.jpg'
    else image_url
  end,
  description = coalesce(description, case slug
    when 'attar-fragrances' then 'Alcohol-free attars and refined fragrances for every occasion.'
    when 'islamic-caps' then 'Traditional and contemporary Islamic caps in distinctive finishes.'
    when 'surma' then 'Traditional surma selected for an authentic everyday ritual.'
    when 'prayer-essentials' then 'Comfortable and thoughtfully selected essentials for worship.'
    when 'islamic-wear' then 'Heritage-inspired clothing and accessories for meaningful occasions.'
    when 'gifts-combos' then 'Curated Sidra favourites presented as thoughtful gift collections.'
    else null
  end)
where slug in ('attar-fragrances', 'islamic-caps', 'surma', 'prayer-essentials', 'islamic-wear', 'gifts-combos');
