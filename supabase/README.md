# Sidra Store Supabase SQL

This directory keeps database and authorization SQL separate from application code. Run migrations in filename order through the Supabase SQL editor or CLI.

1. `migrations/001_admin_authorization.sql`
2. `migrations/002_catalog.sql`
3. `migrations/003_commerce.sql`
4. `migrations/004_storefront_content.sql`
5. `migrations/005_seed_navigation_categories.sql`
6. `migrations/006_customer_checkout.sql`
7. `migrations/007_seed_product_catalog.sql` (generated after ImageKit upload)
8. `migrations/008_seed_category_images.sql`

Run `npm run upload:products` once to upload the product images in `public/Products` to ImageKit. The script reads credentials from `.env`, writes the returned public URLs to `data/imagekit-product-urls.json`, and generates `migrations/007_seed_product_catalog.sql`. Then run migration 007 in the Supabase SQL editor.

For customer signup confirmation, configure Supabase Auth URL settings with your production site URL and add `http://localhost:3000/**` while developing. The app uses Supabase email/password authentication and never sends the service-role key to the browser.

After creating an administrator in Supabase Auth, edit and run `queries/bootstrap_admin.sql` once with that account's email. The query deliberately fails while the placeholder remains unchanged.

The current `/admin` login continues to use server-only `ADMIN_EMAIL` and `ADMIN_PASSWORD` values from `.env`. The Supabase authorization tables and policies are ready for a later migration to Supabase Auth without exposing the service-role key to the browser.

Never place Supabase service-role credentials, admin passwords, or real user identifiers in these SQL files.

