import { NextResponse } from "next/server";
import { createAdminCatalogClient, isAuthorizedAdminRequest } from "@/lib/adminCatalog";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Administrator authentication is required." }, { status: 401 });
  }

  const supabase = createAdminCatalogClient();
  const [
    { data: products, error: productError },
    { data: categories, error: categoryError },
    { data: subcategories, error: subcategoryError },
    { count: orderCount, error: orderError },
    { count: customerCount, error: customerError },
  ] = await Promise.all([
    supabase.from("products").select("id,category_id,is_active,is_featured"),
    supabase.from("categories").select("id,name,is_active,sort_order").order("sort_order"),
    supabase.from("subcategories").select("id,category_id,name,is_active,sort_order").order("sort_order"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
  ]);

  const queryError = productError || categoryError || subcategoryError || orderError || customerError;
  if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 });

  const allProducts = products || [];
  const activeProducts = allProducts.filter((product) => product.is_active);
  const activeCategories = (categories || []).filter((category) => category.is_active);
  const activeCategoryIds = new Set(activeCategories.map((category) => category.id));
  const activeSubcategories = (subcategories || []).filter((subcategory) => subcategory.is_active && activeCategoryIds.has(subcategory.category_id));
  const productCounts = new Map();

  for (const product of activeProducts) {
    productCounts.set(product.category_id, (productCounts.get(product.category_id) || 0) + 1);
  }

  const categorySummary = activeCategories.map((category) => ({
    id: category.id,
    name: category.name,
    subcategories: activeSubcategories.filter((subcategory) => subcategory.category_id === category.id),
    product_count: productCounts.get(category.id) || 0,
  }));

  return NextResponse.json({
    products: { total: allProducts.length, active: activeProducts.length },
    categories: {
      total: (categories || []).length,
      active: activeCategories.length,
      activeSubcategories: activeSubcategories.length,
    },
    categorySummary,
    orders: orderCount || 0,
    customers: customerCount || 0,
    homepage: { featuredProducts: activeProducts.filter((product) => product.is_featured).length },
  }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
