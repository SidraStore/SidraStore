import { NextResponse } from "next/server";
import { createAdminCatalogClient } from "@/lib/adminCatalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminCatalogClient();
  const [slides, announcements, settings, faqs] = await Promise.all([
    supabase.from("hero_slides").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("announcements").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("delivery_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("faqs").select("*").eq("is_active", true).order("sort_order"),
  ]);
  const failure = [slides, announcements, settings, faqs].find((result) => result.error);
  if (failure) return NextResponse.json({ error: failure.error.message }, { status: 500 });
  return NextResponse.json({ hero_slides: slides.data, announcements: announcements.data, delivery_settings: settings.data, faqs: faqs.data }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
