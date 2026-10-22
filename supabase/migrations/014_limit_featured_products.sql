-- Keep homepage featured products intentional and limited to five products.
update public.products
set is_featured = false
where is_featured = true;

update public.products
set is_featured = true
where slug in ('premium-gift-box', 'designer-owaisi-cap', 'sidra-oudh', 'aseel', 'jannatul-ferdous');
