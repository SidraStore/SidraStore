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
9. `migrations/009_normalize_category_slugs_and_images.sql`
10. `migrations/010_seed_demo_orders_and_customers.sql`
11. `migrations/011_storefront_sync_and_checkout_integrity.sql`
12. `migrations/012_add_product_variants.sql`
13. `migrations/013_product_media_reviews_and_cod.sql`
14. `migrations/014_limit_featured_products.sql`
15. `migrations/015_update_premium_attar_catalog.sql`
16. `migrations/016_remove_legacy_attar_products.sql`
17. `migrations/017_review_moderation_and_summaries.sql`
18. `migrations/018_guest_checkout.sql`
19. `migrations/019_cart_activity_notifications.sql`
20. `migrations/020_correct_attar_product_separation.sql`
21. `migrations/021_update_sandal_rose_details.sql`
22. `migrations/022_order_cancellation.sql`
23. `migrations/023_sequential_order_numbering.sql`
24. `migrations/024_product_returns.sql`
25. `migrations/025_inventory_stock_management.sql`
26. `migrations/026_order_tracking_and_notifications.sql`

Run `npm run upload:products` once to upload the product images in `public/products` to ImageKit. The script reads credentials from `.env`, writes the returned public URLs to `data/imagekit-product-urls.json`, and generates `migrations/007_seed_product_catalog.sql`. Then run migration 007 in the Supabase SQL editor.

For customer OTP authentication, run `queries/email-otp-setup.sql` once in the Supabase SQL Editor. Configure Supabase Auth URL settings with your production site URL and add `http://localhost:3000/**` while developing. The app uses Brevo to send OTP emails, while Supabase Auth stores users and sessions; the service-role key is used only on the server and is never sent to the browser.

For Razorpay online payments, run `queries/razorpay-setup.sql` once in the Supabase SQL Editor. Keep `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` server-only. Configure Razorpay Webhooks to send `payment.captured` and `order.paid` events to `/api/payments/razorpay/webhook`.

Migration 018 enables guest COD and Razorpay checkout. Guest orders reuse an existing Supabase Auth customer only when the matching email is confirmed; otherwise they reuse or create an unlinked guest customer record.

Migration 019 records idempotent cart-add activity for authenticated customers. The Admin Panel reads these records through its protected admin API; the Supabase Realtime publication is enabled for the notification table so server-side subscribers can receive inserts without exposing customer details to anonymous storefront clients.

Migration 023 assigns every order a database-owned `SIDRA-01` style number. Existing order UUIDs and related records are preserved; previous display numbers are retained in `orders.legacy_order_number`. Customer checkout, guest checkout, Razorpay finalization, Shipmozo references, customer Order History, admin Orders, and payment confirmations all continue to use `orders.order_number`.

Migration 024 adds the immutable delivery timestamp and one return request per order. Customers can request a return for seven days after delivery; the request reason is required and an optional HTTPS ImageKit evidence URL is supported. The protected admin return API manages `requested`, `approved`, `rejected`, `picked_up`, and `refunded` states, while `order_returns` Realtime events update customer and admin views. Set `IMAGEKIT_PRIVATE_KEY` for customer return-image uploads.

Migration 025 makes `products.inventory_status` database-owned and derives it from `stock_quantity`. Existing authenticated and guest checkout functions lock product rows, re-check the requested quantity, deduct simple or variant stock, and now publish the resulting product row through Supabase Realtime. The storefront only exposes active products with positive stock, while admin stock edits and cancellation stock restoration automatically refresh the same status.

For Vercel deployments, configure `SHIPMOZO_API_BASE_URL`, `SHIPMOZO_PUBLIC_KEY`, `SHIPMOZO_PRIVATE_KEY`, and `SHIPMOZO_PICKUP_ADDRESS_ID` as Production server-side environment variables before using the Admin Panel's AWB actions. Redeploy after changing environment variables. `CRON_SECRET` protects the scheduled tracking sync endpoint, which polls active Shipmozo shipments once daily on Vercel Hobby and writes shipment/order updates back to Supabase Realtime. Use a plan that supports more frequent cron schedules when near-real-time tracking is required.

Run `queries/shipmozo-setup.sql` for a new tracking installation. For an existing Shipmozo installation, run `queries/shipmozo-live-sync.sql` to add the tracking timestamps, event history, and Realtime publication used by the customer Order History timeline.

Migration 026 adds the full order status timeline, the `out_for_delivery` state, Supabase Realtime coverage, and an idempotent private email outbox. The application worker sends queued notifications through Brevo, while the database trigger only records safe, deduplicated work. Set `CRON_SECRET` so `/api/order-notifications` can retry failed deliveries.

After creating an administrator in Supabase Auth, edit and run `queries/bootstrap_admin.sql` once with that account's email. The query deliberately fails while the placeholder remains unchanged.

The current `/admin` login continues to use server-only `ADMIN_EMAIL` and `ADMIN_PASSWORD` values from `.env`. The Supabase authorization tables and policies are ready for a later migration to Supabase Auth without exposing the service-role key to the browser.
