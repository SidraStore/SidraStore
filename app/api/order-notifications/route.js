import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processOrderNotificationQueue, processOrderNotificationsForNumber } from "@/lib/orderNotifications";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorizedCronRequest(request) {
  const configuredSecret = process.env.CRON_SECRET || process.env.SHIPMOZO_SYNC_CRON_SECRET;
  const suppliedSecret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!configuredSecret || !suppliedSecret) return false;

  const expected = Buffer.from(configuredSecret);
  const actual = Buffer.from(suppliedSecret);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) return NextResponse.json({ error: "Cron authentication is required." }, { status: 401 });

  try {
    const result = await processOrderNotificationQueue(createAdminClient());
    return NextResponse.json(result);
  } catch (error) {
    console.error("[order-notifications] Queue processing failed", { error: error.message });
    return NextResponse.json({ error: "Unable to process order notifications." }, { status: 500 });
  }
}

export async function POST(request) {
  const supabase = createServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid order number is required." }, { status: 400 });
  }

  const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber.trim() : "";
  if (!orderNumber || orderNumber.length > 80) return NextResponse.json({ error: "A valid order number is required." }, { status: 400 });

  try {
    const admin = createAdminClient();
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id,customer_id")
      .eq("order_number", orderNumber)
      .single();
    if (orderError || !order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const { data: customer, error: customerError } = await admin
      .from("customers")
      .select("auth_user_id")
      .eq("id", order.customer_id)
      .single();
    if (customerError || customer?.auth_user_id !== user.id) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const result = await processOrderNotificationsForNumber(admin, orderNumber);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[order-notifications] Customer-triggered processing failed", { orderNumber, userId: user.id, error: error.message });
    return NextResponse.json({ error: "Order notifications are queued for retry." }, { status: 202 });
  }
}
