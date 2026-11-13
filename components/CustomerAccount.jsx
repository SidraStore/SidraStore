"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronRight, Clock3, ExternalLink, ImagePlus, LogOut, MapPin, Package, PackageCheck, RotateCcw, ShoppingBag, Upload, UserRound, X, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SmartImage from "./SmartImage";

const fulfillmentSteps = [
  { label: "Order placed", description: "Order received" },
  { label: "Confirmed", description: "Order confirmed" },
  { label: "Processing", description: "Preparing your order" },
  { label: "Shipped", description: "Handed to courier" },
  { label: "Out for delivery", description: "Courier is on the way" },
  { label: "Delivered", description: "Delivered to you" },
];

const orderStatusStyles = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-violet-50 text-violet-700",
  shipped: "bg-cyan-50 text-cyan-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

const cancellationReasons = [
  "I changed my mind",
  "I ordered by mistake",
  "Delivery is taking too long",
  "I found a better option",
  "Other",
];

const returnReasons = [
  "Damaged or defective",
  "Wrong item received",
  "Item not as described",
  "Quality issue",
  "Changed my mind",
  "Other",
];

const returnStatusStyles = {
  requested: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-700",
  rejected: "bg-red-50 text-red-700",
  picked_up: "bg-violet-50 text-violet-700",
  refunded: "bg-emerald-50 text-emerald-700",
};

const returnStatusLabels = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  picked_up: "Return Picked Up",
  refunded: "Refunded",
};

const allowedReturnImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxReturnImageSize = 5 * 1024 * 1024;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function titleCase(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAddress(address) {
  if (!address) return "Address unavailable";
  return [address.address_line_1, address.address_line_2, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(", ");
}

function normalizeTrackingStatus(value) {
  return String(value || "").toLowerCase().replace(/[_-]+/g, " ").trim();
}

function getShipment(order) {
  return order.shipmozo_shipments?.[0] || null;
}

function getOrderReturn(order) {
  return order.order_returns?.[0] || null;
}

function getDeliveryDate(order, shipment) {
  return order.delivered_at || shipment?.delivered_at || (order.status === "delivered" ? order.updated_at : null);
}

function getReturnDeadline(order, shipment) {
  const deliveryDate = getDeliveryDate(order, shipment);
  if (!deliveryDate) return null;
  const deliveryTimestamp = new Date(deliveryDate).getTime();
  return Number.isNaN(deliveryTimestamp) ? null : new Date(deliveryTimestamp + 7 * 24 * 60 * 60 * 1000);
}

function getShipmentLabel(shipment) {
  if (!shipment) return "Not created";
  if (shipment.status === "cancelled") return "Cancelled";
  if (shipment.status === "delivered") return "Delivered";
  const trackingStatus = shipment.tracking_status || getTrackingEvents(shipment)[0]?.status;
  if (trackingStatus) return titleCase(trackingStatus);
  if (shipment.status === "pickup_scheduled") return "Pickup scheduled";
  if (shipment.status === "assigned") return "Courier assigned";
  if (shipment.status === "pushed") return "Courier assignment pending";
  return "Awaiting fulfilment";
}

function getFulfillmentIndex(order, shipment) {
  if (order.status === "cancelled" || shipment?.status === "cancelled") return -1;

  const trackingSignals = [
    order.status,
    shipment?.status,
    shipment?.tracking_status,
    ...getTrackingEvents(shipment).map((event) => event.status),
  ].map(normalizeTrackingStatus);
  if (trackingSignals.some((status) => status.includes("delivered") && !status.includes("rto"))) return 5;
  if (trackingSignals.some((status) => status.includes("out for delivery") || status === "ofd")) return 4;
  if (trackingSignals.some((status) => status === "shipped" || status.includes("in transit") || status.includes("dispatched") || status.includes("picked") || status.includes("pickup scheduled"))) return 3;
  if (trackingSignals.some((status) => status === "processing" || status.includes("packed") || status.includes("assigned"))) return 2;
  if (trackingSignals.some((status) => status === "confirmed" || status.includes("pushed"))) return 1;
  return 0;
}

function getPaymentLabel(order) {
  return order.payment_method === "razorpay" ? "Prepaid / Razorpay" : "Cash on Delivery";
}

function getPaymentMeta(order) {
  if (order.payment_status === "paid") return "Payment confirmed";
  if (order.payment_status === "failed") return "Payment failed";
  if (order.payment_status === "refunded") return "Payment refunded";
  return "Awaiting payment";
}

function canCancelOrder(order) {
  return ["pending", "confirmed", "processing"].includes(String(order.status || "pending"));
}

function getTrackingEvents(shipment) {
  return [...(shipment?.shipmozo_tracking_events || [])].sort((left, right) => {
    const leftTime = new Date(left.event_at || left.created_at || 0).getTime();
    const rightTime = new Date(right.event_at || right.created_at || 0).getTime();
    return rightTime - leftTime;
  });
}

function InfoTile({ label, value, meta }) {
  return (
    <div className="min-w-0 px-1 py-1">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold-dark">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-ink" title={value}>{value}</p>
      <p className="mt-1 text-[10px] text-stone-400">{meta}</p>
    </div>
  );
}

function FulfillmentProgress({ order, shipment }) {
  const activeIndex = getFulfillmentIndex(order, shipment);
  const cancelled = activeIndex === -1;

  return (
    <section className="border-t border-gold/20 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">Live fulfilment progress</p>
          <p className="mt-1 text-sm text-stone-500">Follow every milestone from confirmation to delivery.</p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide ${cancelled ? "text-red-600" : "text-emerald-700"}`}>
          {cancelled ? "Cancelled" : activeIndex === 5 ? "Delivered" : "In progress"}
        </span>
      </div>

      <div className="mt-7 space-y-5 sm:hidden">
        <div className="relative ml-2 border-l border-stone-200 pl-6">
          {fulfillmentSteps.map((step, index) => {
            const complete = !cancelled && index <= activeIndex;
            const current = complete && index === activeIndex;
            return <div key={step.label} className="relative pb-6 last:pb-0"><div className={`absolute -left-[31px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-cream ring-1 ${complete ? "bg-gold ring-gold/40" : "bg-stone-200 ring-stone-200"}`}>{complete && <Check size={9} strokeWidth={3} className="text-white" />}</div><p className={`text-sm font-semibold ${current ? "text-gold-dark" : "text-ink"}`}>{step.label}</p><p className="mt-1 text-xs leading-5 text-stone-500">{cancelled ? "Order cancelled" : complete && !current ? "Complete" : current ? step.description : "Awaiting update"}</p></div>;
          })}
        </div>
        {cancelled && <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-xs text-red-700"><XCircle size={16} className="mt-0.5 shrink-0" /><span><strong>Cancellation update:</strong> {order.cancellation_reason || "This order was cancelled."}{order.cancelled_at ? ` · ${formatDateTime(order.cancelled_at)}` : ""}</span></div>}
      </div>

      <div className="mt-7 hidden overflow-x-auto pb-1 sm:block">
        <div className="min-w-[700px] px-2">
          <div className="relative">
            <div className="absolute left-[8.33%] right-[8.33%] top-1.5 h-px bg-stone-200" />
            <div className="relative grid grid-cols-6 gap-2">
              {fulfillmentSteps.map((step, index) => {
                const complete = !cancelled && index <= activeIndex;
                const current = complete && index === activeIndex;
                return (
                  <div key={step.label} className="text-center">
                    <div className={`mx-auto flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white ring-1 ${complete ? "bg-gold ring-gold/40" : "bg-stone-200 ring-stone-200"}`}>
                      {complete && <Check size={9} strokeWidth={3} className="text-white" />}
                    </div>
                    <p className={`mt-3 text-[10px] font-semibold ${current ? "text-gold-dark" : "text-ink"}`}>{step.label}</p>
                    <p className="mt-1 text-[9px] leading-4 text-stone-400">{cancelled ? "Order cancelled" : complete && !current ? "Complete" : current ? step.description : "Awaiting update"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {cancelled && <div className="mx-2 mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-xs text-red-700"><XCircle size={16} className="mt-0.5 shrink-0" /><span><strong>Cancellation update:</strong> {order.cancellation_reason || "This order was cancelled."}{order.cancelled_at ? ` · ${formatDateTime(order.cancelled_at)}` : ""}</span></div>}
      </div>
    </section>
  );
}

function ShipmentTracking({ order, shipment }) {
  const cancelled = order.status === "cancelled" || shipment?.status === "cancelled";
  const trackingEvents = getTrackingEvents(shipment);
  const latestTrackingStatus = shipment?.tracking_status || trackingEvents[0]?.status;
  const heading = cancelled ? "Shipment cancelled" : shipment?.awb_number ? `${shipment.courier_name || "Courier"} shipment` : "Courier assignment pending";
  const message = cancelled
    ? "Shipment has not been created or was cancelled."
    : shipment?.awb_number
      ? latestTrackingStatus ? `Latest carrier update: ${titleCase(latestTrackingStatus)}.` : "Your AWB has been assigned and tracking is ready."
      : "Tracking will be available once a courier and AWB number are assigned.";

  return (
    <section className="border-t border-gold/20 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">Shipment tracking</p>
          <h4 className="mt-2 font-serif text-xl font-semibold text-ink">{heading}</h4>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide ${cancelled ? "text-red-600" : shipment?.awb_number ? "text-emerald-700" : "text-stone-500"}`}>
          {cancelled ? "Cancelled" : shipment?.awb_number ? "Tracking available" : "Not assigned"}
        </span>
      </div>

      <div className={`mt-5 flex items-center justify-between gap-3 border-y px-1 py-3 text-[11px] ${cancelled ? "border-red-100 text-red-700" : "border-gold/20 text-stone-600"}`}>
        <span className="font-semibold uppercase tracking-wide">{cancelled ? "Shipment cancelled" : shipment?.awb_number ? "Shipment active" : "Shipment pending"}</span>
        <span className="text-right text-stone-400">{message}</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:divide-x sm:divide-gold/15 lg:grid-cols-4">
        <InfoTile label="Shipmozo reference" value={shipment?.provider_order_id || "Not assigned"} meta="Partner order reference" />
        <InfoTile label="Courier" value={shipment?.courier_name || "Not assigned"} meta={shipment?.courier_id ? `Courier ID ${shipment.courier_id}` : "Awaiting courier assignment"} />
        <InfoTile label="AWB number" value={shipment?.awb_number || "Not assigned"} meta={shipment?.awb_number ? "Use this number to track" : "Tracking unavailable yet"} />
        <InfoTile label="Expected delivery" value={shipment?.expected_delivery_at ? formatDate(shipment.expected_delivery_at) : "Not provided"} meta={shipment?.last_synced_at ? `Synced ${formatDateTime(shipment.last_synced_at)}` : "Awaiting carrier estimate"} />
      </div>

      {shipment?.last_error && <p role="alert" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">Tracking is temporarily delayed. The latest saved update is still shown below.</p>}

      {shipment?.tracking_url && !cancelled && <a href={shipment.tracking_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-gold hover:text-ink"><ExternalLink size={14} /> Track shipment</a>}

      {trackingEvents.length > 0 && <div className="mt-6 border-t border-gold/20 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">Tracking history</p>
        <div className="mt-4 divide-y divide-gold/10">
          {trackingEvents.map((event) => <div key={event.id || event.event_key} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-semibold text-ink">{titleCase(event.status)}</p>
                {event.event_at && <time dateTime={event.event_at} className="text-[10px] text-stone-400">{formatDateTime(event.event_at)}</time>}
              </div>
              {event.description && event.description !== event.status && <p className="mt-1 text-xs text-stone-500">{event.description}</p>}
              {event.location && <p className="mt-1 text-xs text-stone-400">{event.location}</p>}
            </div>
          </div>)}
        </div>
      </div>}
    </section>
  );
}

function ReturnRequestPanel({ order, shipment, onRequested }) {
  const returnRequest = getOrderReturn(order);
  const deadline = getReturnDeadline(order, shipment);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (returnRequest) {
    const status = returnRequest.status || "requested";
    return (
      <section className="border-t border-gold/20 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">Product return</p>
            <h4 className="mt-2 flex items-center gap-2 font-serif text-xl font-semibold text-ink"><RotateCcw size={19} className="text-gold-dark" /> Return request</h4>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${returnStatusStyles[status] || "bg-stone-100 text-stone-600"}`}>{returnStatusLabels[status] || titleCase(status)}</span>
        </div>
        <div className="mt-4 rounded-2xl border border-gold/15 bg-cream/60 px-4 py-4 text-sm">
          <p className="font-semibold text-ink">Reason: <span className="font-normal text-stone-600">{returnRequest.reason}</span></p>
          <p className="mt-2 flex items-center gap-2 text-xs text-stone-500"><Clock3 size={14} /> Requested {formatDateTime(returnRequest.requested_at)}</p>
          {returnRequest.admin_note && <p className="mt-3 border-t border-gold/15 pt-3 text-xs leading-5 text-stone-600"><strong>Store update:</strong> {returnRequest.admin_note}</p>}
          {returnRequest.image_url && <a href={returnRequest.image_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-gold-dark hover:underline"><ImagePlus size={14} /> View submitted image</a>}
        </div>
      </section>
    );
  }

  if (order.status !== "delivered") return null;

  if (!deadline || Date.now() > deadline.getTime()) {
    return (
      <section className="border-t border-gold/20 pt-6">
        <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-600">
          <Clock3 size={18} className="mt-0.5 shrink-0 text-stone-400" />
          <div><p className="font-semibold text-ink">Return window closed</p><p className="mt-1 text-xs leading-5">Returns are accepted within 7 days of delivery. This order was delivered on {deadline ? formatDate(new Date(deadline.getTime() - 7 * 24 * 60 * 60 * 1000)) : "an earlier date"}.</p></div>
        </div>
      </section>
    );
  }

  async function submitReturn(event) {
    event.preventDefault();
    const finalReason = reason === "Other" ? customReason.trim() : reason;
    if (!finalReason) return setError("Select a reason to continue.");
    if (finalReason.length < 5) return setError("Please provide at least 5 characters.");
    if (imageFile && (!allowedReturnImageTypes.has(imageFile.type) || imageFile.size > maxReturnImageSize)) {
      return setError("Use a JPG, PNG, or WebP image up to 5 MB.");
    }

    setSubmitting(true);
    setError("");
    try {
      let imageUrl = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadResponse = await fetch("/api/account/returns/upload", { method: "POST", body: formData });
        const uploadResult = await uploadResponse.json().catch(() => ({}));
        if (!uploadResponse.ok) throw new Error(uploadResult.error || "Unable to upload the return image.");
        imageUrl = uploadResult.url;
      }

      const { data, error: requestError } = await createClient().rpc("request_order_return", {
        p_order_id: order.id,
        p_reason: finalReason,
        p_image_url: imageUrl,
      });
      if (requestError) throw new Error(requestError.message || "Unable to submit the return request.");
      onRequested(data);
    } catch (submitError) {
      setError(submitError.message || "Unable to submit the return request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-gold/20 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">Product return</p>
          <h4 className="mt-2 flex items-center gap-2 font-serif text-xl font-semibold text-ink"><RotateCcw size={19} className="text-gold-dark" /> Request a return</h4>
          <p className="mt-1 text-xs text-stone-500">Available until {formatDate(deadline)}. Add a photo if it helps us review the request.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><CheckCircle2 size={13} /> Eligible</span>
      </div>

      <form onSubmit={submitReturn} className="mt-4 rounded-2xl border border-gold/15 bg-cream/50 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-ink sm:col-span-2">Why are you returning this order?
            <select value={reason} onChange={(event) => setReason(event.target.value)} disabled={submitting} className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/10 disabled:cursor-not-allowed disabled:bg-stone-50">
              <option value="">Select a reason</option>{returnReasons.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          {reason === "Other" && <label className="text-sm font-semibold text-ink sm:col-span-2">Tell us a little more
            <textarea value={customReason} onChange={(event) => setCustomReason(event.target.value)} maxLength={500} rows={3} disabled={submitting} placeholder="Enter your reason" className="mt-2 w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm font-normal outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/10 disabled:cursor-not-allowed disabled:bg-stone-50" />
          </label>}
          <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gold/40 bg-white px-3 py-2 text-xs font-semibold text-gold-dark transition hover:border-gold hover:bg-cream sm:col-span-2">
            <Upload size={16} />
            <span className="min-w-0 flex-1 truncate">{imageFile ? imageFile.name : "Add an image (optional)"}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setImageFile(event.target.files?.[0] || null); setError(""); }} disabled={submitting} className="sr-only" />
          </label>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-stone-400">JPG, PNG, or WebP · maximum 5 MB</p>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">{error}</p>}
        <button type="submit" disabled={submitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
          <RotateCcw size={15} />{submitting ? "Submitting..." : "Submit return request"}
        </button>
      </form>
    </section>
  );
}

function OrderSummaryCard({ order, onOpen }) {
  const status = String(order.status || "pending");
  const items = order.order_items || [];
  const thumbnails = items.length ? items.slice(0, 3) : [{ id: "empty" }];

  return (
    <button
      type="button"
      onClick={() => onOpen(order.id)}
      aria-label={`View details for order ${order.order_number}`}
      className="group w-full text-left transition hover:bg-cream/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
    >
      <div className="flex flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap sm:px-6 sm:py-5">
        <div className="flex shrink-0 -space-x-3" aria-hidden="true">
          {thumbnails.map((item, index) => (
            <SmartImage
              key={item.id}
              src={item.products?.image_url}
              alt=""
              className={`h-14 w-14 rounded-xl border-2 border-white bg-cream shadow-sm ${index > 0 ? "relative" : ""}`}
              imgClassName="h-full w-full rounded-[10px] object-cover"
              fallback={<Package size={19} className="mx-auto mt-4 text-gold-dark/60" />}
            />
          ))}
        </div>

        <div className="min-w-[9rem] flex-1">
          <p className="text-sm font-bold text-ink">{order.order_number}</p>
          <p className="mt-1 text-xs text-stone-500">Placed {formatDate(order.created_at)}</p>
        </div>

        <div className="ml-auto text-right">
          <p className="text-base font-bold text-ink sm:text-lg">{formatCurrency(order.total)}</p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-400">Total</p>
        </div>

        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${orderStatusStyles[status] || "bg-stone-100 text-stone-600"}`}>{titleCase(status)}</span>
        <ChevronRight size={18} className="shrink-0 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-gold-dark" />
      </div>
    </button>
  );
}

function OrderDetailsView({ order, onCancel, canceling, onReturnRequested }) {
  const shipment = getShipment(order);
  const status = String(order.status || "pending");
  const items = order.order_items || [];

  return (
    <article className="overflow-hidden rounded-[24px] border border-gold/25 bg-white shadow-[0_18px_55px_-38px_rgba(50,35,20,0.5)]">
      <header className="border-b border-gold/20 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">Order reference</p>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <h3 className="font-serif text-2xl font-semibold text-ink">{order.order_number}</h3>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${orderStatusStyles[status] || "bg-stone-100 text-stone-600"}`}>{titleCase(status)}</span>
            </div>
            <p className="mt-1 text-xs text-stone-400">Placed {formatDate(order.created_at)} <span className="mx-1">·</span> {order.payment_method === "razorpay" ? getPaymentMeta(order) : `Cash on Delivery · ${getPaymentMeta(order)}`}</p>
          </div>
          <div className="flex flex-col items-start gap-3 text-left sm:items-end sm:text-right">
            <p className="text-xl font-bold text-ink">{formatCurrency(order.total)}</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-400">Order total</p>
            {canCancelOrder(order) && <button type="button" onClick={() => onCancel(order)} disabled={canceling} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"><X size={14} />{canceling ? "Cancelling..." : "Cancel order"}</button>}
          </div>
        </div>
      </header>

      <div className="space-y-6 p-5 sm:p-7">
        <div className="divide-y border-y border-stone-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-4">
              <SmartImage
                src={item.products?.image_url}
                alt=""
                className="h-14 w-14 shrink-0 rounded-xl border border-gold/15 bg-white"
                imgClassName="h-full w-full object-cover"
                fallback={<Package size={20} className="mx-auto mt-4 text-gold-dark/60" />}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{item.product_name}{item.variant_label ? ` (${item.variant_label})` : ""}</p>
                <p className="mt-1 text-xs text-stone-500">Quantity {item.quantity} <span className="mx-1">×</span> {formatCurrency(item.unit_price)}</p>
              </div>
              <p className="text-sm font-bold text-ink">{formatCurrency(item.line_total)}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 border-y border-gold/15 py-4 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-gold/15">
          <InfoTile label="Payment" value={getPaymentLabel(order)} meta={getPaymentMeta(order)} />
          <InfoTile label="Delivery status" value={titleCase(status)} meta={getShipmentLabel(shipment)} />
          <InfoTile label="Shipping" value={Number(order.shipping_amount) > 0 ? formatCurrency(order.shipping_amount) : "Free"} meta="Delivery charge" />
          <InfoTile label="Reference" value={order.order_number} meta="Sidra Store order" />
        </div>

        <section className="border-b border-gold/15 pb-5">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-dark">Shipping address</h4>
          <p className="mt-2 flex gap-2 text-sm leading-6 text-stone-600"><MapPin size={16} className="mt-1 shrink-0 text-gold-dark" />{formatAddress(order.shipping_address)}</p>
        </section>

        {status === "cancelled" && <div className="rounded-2xl border border-red-100 bg-red-50/70 px-4 py-4 text-sm text-red-800">
          <div className="flex items-start gap-3"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Order cancelled{order.cancelled_at ? ` on ${formatDateTime(order.cancelled_at)}` : ""}</p><p className="mt-1 text-red-700">Reason: {order.cancellation_reason || "Not provided"}</p>{order.stock_restored_at && <p className="mt-1 text-xs text-red-600">Inventory was restored for this order.</p>}</div></div>
        </div>}

        <FulfillmentProgress order={order} shipment={shipment} />
        <ShipmentTracking order={order} shipment={shipment} />
        <ReturnRequestPanel order={order} shipment={shipment} onRequested={(returnRequest) => onReturnRequested(order.id, returnRequest)} />
      </div>
    </article>
  );
}

export default function CustomerAccount({ user, customer, address, orders }) {
  const [liveOrders, setLiveOrders] = useState(orders);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customCancelReason, setCustomCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const selectedOrder = liveOrders.find((order) => order.id === selectedOrderId) || null;

  useEffect(() => {
    if (selectedOrderId && !selectedOrder) setSelectedOrderId(null);
  }, [selectedOrderId, selectedOrder]);

  useEffect(() => {
    if (!cancelTarget) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") closeCancellation(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [cancelTarget, cancelLoading]);

  useEffect(() => {
    setLiveOrders(orders);
  }, [orders]);

  useEffect(() => {
    if (!customer?.id) return undefined;
    const supabase = createClient();
    const channel = supabase
      .channel(`customer-order-sync-${customer.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `customer_id=eq.${customer.id}` }, (payload) => {
        setLiveOrders((current) => {
          if (payload.eventType === "DELETE") return current.filter((order) => order.id !== payload.old.id);
          const exists = current.some((order) => order.id === payload.new.id);
          if (!exists) return current;
          return current.map((order) => order.id === payload.new.id ? { ...order, ...payload.new } : order);
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "order_returns" }, (payload) => {
        const returnRequest = payload.eventType === "DELETE" ? payload.old : payload.new;
        setLiveOrders((current) => current.map((order) => {
          if (order.id !== returnRequest.order_id) return order;
          const existingReturns = order.order_returns || [];
          if (payload.eventType === "DELETE") return { ...order, order_returns: existingReturns.filter((item) => item.id !== returnRequest.id) };
          const nextReturns = existingReturns.some((item) => item.id === returnRequest.id)
            ? existingReturns.map((item) => item.id === returnRequest.id ? { ...item, ...returnRequest } : item)
            : [returnRequest, ...existingReturns];
          return { ...order, order_returns: nextReturns };
        }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "shipmozo_shipments" }, (payload) => {
        const shipment = payload.eventType === "DELETE" ? payload.old : payload.new;
        setLiveOrders((current) => current.map((order) => {
          if (order.id !== shipment.order_id) return order;
          const existingShipments = order.shipmozo_shipments || [];
          if (payload.eventType === "DELETE") return { ...order, shipmozo_shipments: existingShipments.filter((item) => item.id !== shipment.id) };
          const nextShipments = existingShipments.some((item) => item.id === shipment.id)
            ? existingShipments.map((item) => item.id === shipment.id ? { ...item, ...shipment } : item)
            : [shipment, ...existingShipments];
          return { ...order, shipmozo_shipments: nextShipments };
        }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "shipmozo_tracking_events" }, (payload) => {
        const event = payload.eventType === "DELETE" ? payload.old : payload.new;
        setLiveOrders((current) => current.map((order) => {
          const shipments = order.shipmozo_shipments || [];
          if (!shipments.some((shipment) => shipment.id === event.shipment_id)) return order;
          return {
            ...order,
            shipmozo_shipments: shipments.map((shipment) => {
              if (shipment.id !== event.shipment_id) return shipment;
              const events = shipment.shipmozo_tracking_events || [];
              if (payload.eventType === "DELETE") return { ...shipment, shipmozo_tracking_events: events.filter((item) => item.id !== event.id) };
              const nextEvents = events.some((item) => item.id === event.id)
                ? events.map((item) => item.id === event.id ? { ...item, ...event } : item)
                : [event, ...events];
              return { ...shipment, shipmozo_tracking_events: nextEvents };
            }),
          };
        }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [customer?.id]);

  function openCancellation(order) {
    setCancelTarget(order);
    setCancelReason("");
    setCustomCancelReason("");
    setCancelError("");
  }

  function closeCancellation() {
    if (cancelLoading) return;
    setCancelTarget(null);
    setCancelError("");
  }

  async function confirmCancellation() {
    const reason = cancelReason === "Other" ? customCancelReason.trim() : cancelReason;
    if (!reason) return setCancelError("Select a reason to continue.");
    if (reason.length < 5) return setCancelError("Please provide at least 5 characters.");

    setCancelLoading(true);
    setCancelError("");
    const { data, error } = await createClient().rpc("cancel_order", {
      p_order_id: cancelTarget.id,
      p_reason: reason,
    });
    setCancelLoading(false);

    if (error) return setCancelError(error.message || "Unable to cancel this order.");
    setLiveOrders((current) => current.map((order) => order.id === cancelTarget.id ? { ...order, ...(data || {}) } : order));
    setCancelTarget(null);
  }

  function handleReturnRequested(orderId, returnRequest) {
    setLiveOrders((current) => current.map((order) => order.id === orderId ? { ...order, order_returns: [returnRequest] } : order));
  }

  async function signOut() {
    const { error } = await createClient().auth.signOut();
    if (!error) window.location.assign("/");
  }

  return (
    <main className="min-h-[68vh] overflow-x-clip bg-cream px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">My account</p><h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Welcome, {customer?.full_name || "Sidra customer"}</h1><p className="mt-2 text-stone-500">{user.email}</p></div>
          <button type="button" onClick={signOut} className="flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold transition hover:border-gold"><LogOut size={16} /> Sign Out</button>
        </div>

        <div className="mt-8 grid gap-5 border-y border-gold/15 py-5 md:grid-cols-2 md:divide-x md:divide-gold/15">
          <div className="flex items-center gap-3 md:pr-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dark"><UserRound size={19} /></span><div><h2 className="text-sm font-bold">Customer details</h2><p className="mt-1 text-sm text-stone-500">{customer?.phone || "Phone number not saved"}</p></div></div>
          <div className="flex items-start gap-3 md:pl-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-dark"><MapPin size={19} /></span><div><h2 className="text-sm font-bold">Default delivery address</h2><p className="mt-1 text-sm leading-6 text-stone-500">{formatAddress(address)}</p></div></div>
        </div>

        <section className="mx-auto mt-10 max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-gold/15 pb-6">
            <div><h2 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Order History</h2><p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">Select an order to view products, payment, delivery, cancellation, returns, and live tracking.</p></div>
            <div className="flex items-center gap-2.5 text-right"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Live order sync</p><p className="mt-1 text-[10px] text-stone-400">Updates appear automatically</p></div></div>
          </div>

          {selectedOrder ? <div>
            <div className="pt-6"><button type="button" onClick={() => setSelectedOrderId(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><ArrowLeft size={16} /> Back to order history</button></div>
            <div className="mt-4"><OrderDetailsView order={selectedOrder} onCancel={openCancellation} canceling={cancelTarget?.id === selectedOrder.id && cancelLoading} onReturnRequested={handleReturnRequested} /></div>
          </div> : liveOrders.length === 0 ? <div className="border-y border-gold/15 px-5 py-14 text-center"><PackageCheck size={44} className="mx-auto text-stone-300" /><p className="mt-4 font-serif text-2xl font-semibold text-ink">Your journey starts here.</p><p className="mt-2 text-sm text-stone-500">You have not placed an order yet.</p><a href="/shop" className="btn-gold mt-6">Explore the collection</a></div> : <div className="mt-6 overflow-hidden rounded-[20px] border border-gold/25 bg-white shadow-[0_18px_55px_-38px_rgba(50,35,20,0.5)] divide-y divide-gold/15">{liveOrders.map((order) => <OrderSummaryCard key={order.id} order={order} onOpen={setSelectedOrderId} />)}</div>}
        </section>
      </div>

      {cancelTarget && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/45 p-4 sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCancellation(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="cancel-order-title" className="w-full max-w-md rounded-3xl border border-gold/25 bg-cream p-5 shadow-[0_28px_80px_-24px_rgba(21,16,12,0.65)] sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-700">Order cancellation</p><h2 id="cancel-order-title" className="mt-2 font-serif text-2xl font-semibold text-ink">Cancel {cancelTarget.order_number}?</h2></div><button type="button" onClick={closeCancellation} disabled={cancelLoading} aria-label="Close cancellation dialog" className="rounded-full p-2 text-stone-500 transition hover:bg-white hover:text-ink disabled:opacity-50"><X size={18} /></button></div>
          <p className="mt-3 text-sm leading-6 text-stone-600">This will cancel the order and return its items to available stock. This action cannot be undone.</p>
          <label className="mt-5 block text-sm font-semibold text-ink">Why are you cancelling?
            <select autoFocus value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} disabled={cancelLoading} className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/10 disabled:cursor-not-allowed disabled:bg-stone-50">
              <option value="">Select a reason</option>{cancellationReasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
            </select>
          </label>
          {cancelReason === "Other" && <label className="mt-4 block text-sm font-semibold text-ink">Tell us a little more
            <textarea value={customCancelReason} onChange={(event) => setCustomCancelReason(event.target.value)} maxLength={500} rows={3} disabled={cancelLoading} placeholder="Enter your reason" className="mt-2 w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm font-normal outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/10 disabled:cursor-not-allowed disabled:bg-stone-50" />
          </label>}
          {cancelError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{cancelError}</p>}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={closeCancellation} disabled={cancelLoading} className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-gold disabled:opacity-50">Keep order</button><button type="button" onClick={confirmCancellation} disabled={cancelLoading} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50">{cancelLoading ? "Cancelling..." : "Yes, cancel order"}</button></div>
        </section>
      </div>}
    </main>
  );
}
