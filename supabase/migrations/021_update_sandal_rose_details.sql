begin;

do $$
begin
  if not exists (select 1 from public.products where slug = 'sandal-rose') then
    raise exception 'Product sandal-rose was not found.';
  end if;

  update public.products
  set short_description = 'Sandal Rose Attar',
      description = $product$Sandal rose attar also known as Sandali Gulab or Rooh Gulab and Sandal, is a traditional, alcohol-free natural perfume oil.

Sandal rose attar is a classic oriental blend that combines the rich, creamy warmth of sandalwood with the romantic, velvety depth of rose.$product$
  where slug = 'sandal-rose';
end;
$$;

commit;
