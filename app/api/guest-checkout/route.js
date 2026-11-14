import { NextResponse } from "next/server";
import { processOrderNotificationsForNumber } from "@/lib/orderNotifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseGuestCheckoutPayload } from "@/lib/guestCheckout";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = parseGuestCheckoutPayload(body?.guestCheckout);
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const admin = createAdminClient();
    const { data: orderNumber, error } = await admin.rpc("place_guest_order", {
      p_full_name: parsed.data.fullName,
      p_email: parsed.data.email,
      p_phone: parsed.data.phone,
      p_address: parsed.data.address,
      p_items: parsed.data.items,
      p_payment_method: "cod",
      p_payment_status: "pending",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    try {
      await processOrderNotificationsForNumber(admin, orderNumber);
    } catch (notificationError) {
      console.error("[guest-checkout] Order notification queued for retry", { orderNumber, error: notificationError.message });
    }

    return NextResponse.json({ orderNumber });
  } catch (error) {
    console.error("[guest-checkout] Unable to place guest order", error);
    return NextResponse.json({ error: "We could not place your order. Please try again." }, { status: 500 });
  }
}
