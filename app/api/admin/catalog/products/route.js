import { NextResponse } from "next/server";
import { createAdminCatalogClient, createSlug, isAuthorizedAdminRequest } from "@/lib/adminCatalog";

function productPayload(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || !body.category_id || !body.image_url) throw new Error("Name, category, and product image are required.");
  const price = Number(body.price);
  const stockQuantity = Number(body.stock_quantity);
  if (!Number.isFinite(price) || price < 0) throw new Error("Enter a valid product price.");
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) throw new Error("Enter a valid stock quantity.");
  return {
    name,
    slug: createSlug(name),
    category_id: body.category_id,
    subcategory_id: body.subcategory_id || null,
    short_description: String(body.short_description || "").trim() || name,
    description: String(body.description || "").trim() || null,
    price,
    stock_quantity: stockQuantity,
    image_url: String(body.image_url).trim(),
    gallery_urls: Array.isArray(body.gallery_urls) ? [...new Set(body.gallery_urls.map((url) => String(url).trim()).filter(Boolean))] : [],
    badge: String(body.badge || "").trim() || null,
    is_active: body.is_active !== false,
  };
}

export async function GET(request) {
  if (!isAuthorizedAdminRequest(request)) return NextResponse.json({ error: "Administrator authentication is required." }, { status: 401 });
  const supabase = createAdminCatalogClient();
  const { data, error } = await supabase.from("products").select("id,name,slug,category_id,subcategory_id,short_description,description,price,stock_quantity,image_url,gallery_urls,variants,badge,rating,review_count,is_active,categories(name),subcategories(name)").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(request) {
  if (!isAuthorizedAdminRequest(request)) return NextResponse.json({ error: "Administrator authentication is required." }, { status: 401 });
  try {
    const payload = productPayload(await request.json());
    const supabase = createAdminCatalogClient();
    const { data, error } = await supabase.from("products").insert(payload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

