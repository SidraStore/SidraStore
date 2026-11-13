import { NextResponse } from "next/server";
import { createAdminCatalogClient, isAuthorizedAdminRequest } from "@/lib/adminCatalog";

const orderStatuses = new Set(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]);

export async function PATCH(request, { params }) {
  if (!isAuthorizedAdminRequest(request)) return NextResponse.json({ error: "Administrator authentication is required." }, { status: 401 });
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid order update is required." }, { status: 400 });
  }
  if (!orderStatuses.has(body.status)) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });

  const supabase = createAdminCatalogClient();
  if (body.status === "cancelled") {
    if (typeof body.reason !== "string" || body.reason.trim().length < 5) {
      return NextResponse.json({ error: "A cancellation reason of at least 5 characters is required." }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("cancel_order", {
      p_order_id: params.id,
      p_reason: body.reason.trim(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ order: data });
  }

  const { data: currentOrder, error: currentOrderError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", params.id)
    .single();
  if (currentOrderError) return NextResponse.json({ error: currentOrderError.message }, { status: 400 });
  if (currentOrder.status === "cancelled") return NextResponse.json({ error: "A cancelled order cannot be reopened." }, { status: 409 });

  const { data, error } = await supabase
    .from("orders")
    .update({ status: body.status })
    .eq("id", params.id)
    .select("id,status,payment_status,updated_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ order: data });
}
