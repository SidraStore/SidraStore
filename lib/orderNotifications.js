import { sendBrevoEmail } from "@/lib/brevo";

const notificationCopy = {
  order_placed: { subject: "Order received", heading: "We have received your order." },
  order_confirmed: { subject: "Order confirmed", heading: "Your order is confirmed." },
  order_processing: { subject: "Your order is being prepared", heading: "We are preparing your order." },
  order_shipped: { subject: "Your order is on the way", heading: "Your order has been handed to the courier." },
  order_out_for_delivery: { subject: "Your order is out for delivery", heading: "Your order is on the way to you today." },
  order_delivered: { subject: "Order delivered", heading: "Your order has been delivered." },
  order_cancelled: { subject: "Order cancelled", heading: "Your order has been cancelled." },
  payment_updated: { subject: "Payment update", heading: "Your payment status has changed." },
  return_updated: { subject: "Return request update", heading: "Your return request has been updated." },
  shipment_details: { subject: "Your tracking details are ready", heading: "Your courier tracking details are available." },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function titleCase(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getShipment(order) {
  return order.shipmozo_shipments?.[0] || null;
}

function getReturnRequest(order) {
  return order.order_returns?.[0] || null;
}

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function buildTrackingMarkup(shipment) {
  if (!shipment) return "";

  const details = [
    shipment.courier_name && `<p style="margin:0 0 8px;"><strong>Courier:</strong> ${escapeHtml(shipment.courier_name)}</p>`,
    shipment.awb_number && `<p style="margin:0 0 8px;"><strong>AWB number:</strong> ${escapeHtml(shipment.awb_number)}</p>`,
    shipment.tracking_url && isSafeHttpUrl(shipment.tracking_url) && `<p style="margin:0;"><a href="${escapeHtml(shipment.tracking_url)}" target="_blank" style="color:#8f6424;font-weight:700;">Open live tracking</a></p>`,
  ].filter(Boolean).join("");

  return details ? `<div style="margin:24px 0;padding:18px 20px;background:#fbf7ef;border:1px solid #ead9b9;border-radius:12px;color:#4c5660;font-size:14px;line-height:22px;">${details}</div>` : "";
}

function buildOrderEmailHtml({ order, notification }) {
  const copy = notificationCopy[notification.event_type] || notificationCopy.order_placed;
  const customerName = escapeHtml(order.customers?.full_name || order.shipping_address?.recipient_name || "there");
  const shipment = getShipment(order);
  const returnRequest = getReturnRequest(order);
  const paymentStatus = notification.event_value || order.payment_status;
  const returnStatus = notification.event_value || returnRequest?.status;
  const items = (order.order_items || []).map((item) => `<tr><td style="padding:10px 0;border-bottom:1px solid #eee7dc;">${escapeHtml(item.product_name)}${item.variant_label ? ` (${escapeHtml(item.variant_label)})` : ""} × ${item.quantity}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #eee7dc;">${formatCurrency(item.line_total)}</td></tr>`).join("");
  const trackingMarkup = buildTrackingMarkup(shipment);
  const extraCopy = notification.event_type === "order_cancelled"
    ? `<p style="margin:16px 0 0;color:#9d2d2d;"><strong>Reason:</strong> ${escapeHtml(order.cancellation_reason || "Not provided")}</p>`
    : notification.event_type === "payment_updated"
      ? `<p style="margin:16px 0 0;"><strong>Payment status:</strong> ${escapeHtml(titleCase(paymentStatus))}</p>`
      : notification.event_type === "return_updated" && returnRequest
        ? `<p style="margin:16px 0 0;"><strong>Return status:</strong> ${escapeHtml(titleCase(returnStatus))}</p>${returnRequest.admin_note ? `<p style="margin:8px 0 0;"><strong>Store note:</strong> ${escapeHtml(returnRequest.admin_note)}</p>` : ""}`
        : "";

  return `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#f6f2ea;color:#172533;font-family:Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2ea;"><tr><td align="center" style="padding:32px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #e8dfd1;border-radius:18px;overflow:hidden;"><tr><td align="center" style="padding:26px 24px;border-bottom:1px solid #eee7dc;"><img src="${escapeHtml(`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sidrastore.in"}/images/logo.png`)}" width="170" alt="Sidra Store" style="display:block;max-width:70%;height:auto;"></td></tr><tr><td style="padding:34px 36px 30px;"><p style="margin:0 0 10px;color:#b3833c;font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;">Sidra Store order update</p><h1 style="margin:0 0 18px;font-size:28px;line-height:36px;">${escapeHtml(copy.heading)}</h1><p style="margin:0;color:#4c5660;font-size:16px;line-height:26px;">Hello ${customerName},</p><p style="margin:10px 0 0;color:#4c5660;font-size:15px;line-height:24px;">Order <strong>${escapeHtml(order.order_number)}</strong> · ${escapeHtml(formatDate(order.updated_at || order.created_at))}</p>${extraCopy}${trackingMarkup}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #eee7dc;color:#4c5660;font-size:14px;line-height:20px;">${items}<tr><td style="padding-top:14px;font-weight:700;color:#172533;">Order total</td><td align="right" style="padding-top:14px;font-weight:700;color:#172533;">${formatCurrency(order.total)}</td></tr></table><p style="margin:24px 0 0;color:#7a838b;font-size:13px;line-height:21px;">Payment: ${escapeHtml(order.payment_method === "razorpay" ? "Prepaid / Razorpay" : "Cash on Delivery")} · ${escapeHtml(titleCase(order.payment_status))}</p></td></tr><tr><td align="center" style="padding:20px 24px;background:#172533;color:#fff;font-size:12px;line-height:18px;">Authentic products. Thoughtful service.</td></tr></table></td></tr></table></body></html>`;
}

function buildOrderEmailText({ order, notification }) {
  const copy = notificationCopy[notification.event_type] || notificationCopy.order_placed;
  const shipment = getShipment(order);
  const returnRequest = getReturnRequest(order);
  const paymentStatus = notification.event_value || order.payment_status;
  const returnStatus = notification.event_value || returnRequest?.status;
  const items = (order.order_items || []).map((item) => `- ${item.product_name}${item.variant_label ? ` (${item.variant_label})` : ""} × ${item.quantity}: ${formatCurrency(item.line_total)}`).join("\n");
  const tracking = shipment ? [
    shipment.courier_name && `Courier: ${shipment.courier_name}`,
    shipment.awb_number && `AWB number: ${shipment.awb_number}`,
    shipment.tracking_url && isSafeHttpUrl(shipment.tracking_url) && `Tracking link: ${shipment.tracking_url}`,
  ].filter(Boolean).join("\n") : "";
  const extras = notification.event_type === "order_cancelled"
    ? `Reason: ${order.cancellation_reason || "Not provided"}`
    : notification.event_type === "payment_updated"
      ? `Payment status: ${titleCase(paymentStatus)}`
      : notification.event_type === "return_updated" && returnRequest
        ? `Return status: ${titleCase(returnStatus)}${returnRequest.admin_note ? `\nStore note: ${returnRequest.admin_note}` : ""}`
        : "";

  return `${copy.heading}\n\nOrder ${order.order_number}\n${extras}\n${tracking}\n\n${items}\n\nOrder total: ${formatCurrency(order.total)}\nPayment: ${order.payment_method === "razorpay" ? "Prepaid / Razorpay" : "Cash on Delivery"} · ${titleCase(order.payment_status)}\n`;
}

async function loadOrder(supabase, orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select("id,order_number,customer_email,shipping_address,status,payment_status,payment_method,subtotal,shipping_amount,total,created_at,updated_at,cancellation_reason,customers(full_name),order_items(product_name,variant_label,quantity,line_total),shipmozo_shipments(courier_name,awb_number,tracking_url),order_returns(status,admin_note)")
    .eq("id", orderId)
    .single();
  if (error) throw new Error(`Unable to load order notification data: ${error.message}`);
  return data;
}

async function claimNotification(supabase, notification) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("order_email_notifications")
    .update({ status: "processing", locked_at: now, attempt_count: notification.attempt_count + 1, updated_at: now })
    .eq("id", notification.id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Unable to claim order notification: ${error.message}`);
  return data;
}

async function recordNotificationFailure(supabase, notification, error) {
  const attemptCount = notification.attempt_count;
  const permanentlyFailed = attemptCount >= 5;
  const retryAt = new Date(Date.now() + Math.min(60 * 60 * 1000, 2 ** attemptCount * 60 * 1000)).toISOString();
  const { error: updateError } = await supabase
    .from("order_email_notifications")
    .update({
      status: permanentlyFailed ? "failed" : "pending",
      available_at: retryAt,
      locked_at: null,
      last_error: String(error.message || error).slice(0, 1000),
      updated_at: new Date().toISOString(),
    })
    .eq("id", notification.id);
  if (updateError) throw new Error(`Unable to record notification failure: ${updateError.message}`);
}

export async function processOrderNotificationQueue(supabase, { orderId, limit = 25 } = {}) {
  const staleBefore = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { error: staleError } = await supabase
    .from("order_email_notifications")
    .update({ status: "pending", locked_at: null, updated_at: new Date().toISOString() })
    .eq("status", "processing")
    .lt("locked_at", staleBefore);
  if (staleError) throw new Error(`Unable to release stale order notifications: ${staleError.message}`);

  let query = supabase
    .from("order_email_notifications")
    .select("*")
    .eq("status", "pending")
    .lte("available_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);
  if (orderId) query = query.eq("order_id", orderId);

  const { data: notifications, error } = await query;
  if (error) throw new Error(`Unable to load order notification queue: ${error.message}`);

  let sent = 0;
  let failed = 0;
  for (const notification of notifications || []) {
    const claimed = await claimNotification(supabase, notification);
    if (!claimed) continue;

    try {
      const order = await loadOrder(supabase, claimed.order_id);
      const copy = notificationCopy[claimed.event_type] || notificationCopy.order_placed;
      await sendBrevoEmail({
        email: claimed.recipient_email,
        name: order.customers?.full_name || order.shipping_address?.recipient_name || claimed.recipient_email,
        subject: `${copy.subject} · ${order.order_number}`,
        textContent: buildOrderEmailText({ order, notification: claimed }),
        htmlContent: buildOrderEmailHtml({ order, notification: claimed }),
      });
      const { error: sentError } = await supabase
        .from("order_email_notifications")
        .update({ status: "sent", sent_at: new Date().toISOString(), locked_at: null, last_error: null, updated_at: new Date().toISOString() })
        .eq("id", claimed.id)
        .eq("status", "processing");
      if (sentError) throw new Error(`Unable to mark order notification as sent: ${sentError.message}`);
      sent += 1;
    } catch (sendError) {
      failed += 1;
      await recordNotificationFailure(supabase, claimed, sendError);
      console.error("[order-notifications] Delivery failed", { notificationId: claimed.id, orderId: claimed.order_id, error: sendError.message });
    }
  }

  return { queued: notifications?.length || 0, sent, failed };
}

export async function processOrderNotificationsForNumber(supabase, orderNumber) {
  const { data: order, error } = await supabase.from("orders").select("id").eq("order_number", orderNumber).single();
  if (error) throw new Error(`Unable to find order for notification delivery: ${error.message}`);
  return processOrderNotificationQueue(supabase, { orderId: order.id });
}
