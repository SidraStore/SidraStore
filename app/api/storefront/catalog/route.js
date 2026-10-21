import { NextResponse } from "next/server";
import { createAdminCatalogClient } from "@/lib/adminCatalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminCatalogClient();
  const [{ data: categories, error: categoryError }, { data: products, error: productError }] = await Promise.all([
    supabase.from("categories").select("id,name,slug,description,image_url,sort_order,subcategories(id,name,slug,sort_order,is_active)").eq("is_active", true).order("sort_order"),
    supabase.from("products").select("id,name,slug,short_description,description,price,stock_quantity,image_url,badge,rating,review_count,category_id,subcategory_id,categories(name,slug),subcategories(name,slug)").eq("is_active", true).order("created_at"),
  ]);
  const error = categoryError || productError;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const uniqueCategories = [...new Map(
    categories.map((category) => [category.name.trim().toLowerCase(), category]),
  ).values()];
  return NextResponse.json({ categories: uniqueCategories, products }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
