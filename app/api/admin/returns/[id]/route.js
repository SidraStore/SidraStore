import { NextResponse } from "next/server";
import { createAdminCatalogClient, isAuthorizedAdminRequest } from "@/lib/adminCatalog";

const returnStatuses = new Set(["requested", "approved", "rejected", "picked_up", "refunded"]);

export async function PATCH(request, { params }) {
  if (!isAuthorizedAdminRequest(request)) return NextResponse.json({ error: "Administrator authentication is required." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid return update is required." }, { status: 400 });
  }

  if (!body || !returnStatuses.has(body.status)) return NextResponse.json({ error: "Invalid return status." }, { status: 400 });
  if (body.admin_note !== undefined && (typeof body.admin_note !== "string" || body.admin_note.trim().length > 500)) {
    return NextResponse.json({ error: "Admin notes must be 500 characters or fewer." }, { status: 400 });
  }

  const supabase = createAdminCatalogClient();
  const { data: returnRequest, error: updateError } = await supabase.rpc("admin_update_order_return", {
    p_return_id: params.id,
    p_status: body.status,
    p_admin_note: body.admin_note === undefined ? null : body.admin_note,
  });
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ returnRequest });
}
