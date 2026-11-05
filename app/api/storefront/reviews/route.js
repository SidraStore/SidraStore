import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase storefront access is not configured.");

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET() {
  try {
    const { data, error } = await createPublicClient()
      .from("reviews")
      .select("id,customer_name,rating,title,body,created_at,products(name,slug)")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) throw new Error(error.message);
    const reviews = (data || []).map((review) => ({
      id: review.id,
      name: review.customer_name,
      place: "Verified customer review",
      rating: Number(review.rating),
      product: review.products?.name || "Sidra Store product",
      img: null,
      text: review.body,
      created_at: review.created_at,
    }));
    return NextResponse.json({ reviews }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
