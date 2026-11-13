import { createClient } from "@/lib/supabase/client";

export const STOREFRONT_SYNC_KEY = "sidra_storefront_sync";

export function notifyStorefrontUpdate(scope) {
  const update = JSON.stringify({ scope, timestamp: Date.now() });
  window.localStorage.setItem(STOREFRONT_SYNC_KEY, update);
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(STOREFRONT_SYNC_KEY);
    channel.postMessage(update);
    channel.close();
  }
}

export function subscribeToStorefrontUpdates(callback) {
  const onStorage = (event) => { if (event.key === STOREFRONT_SYNC_KEY) callback(); };
  window.addEventListener("storage", onStorage);
  const broadcastChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(STOREFRONT_SYNC_KEY) : null;
  if (broadcastChannel) broadcastChannel.onmessage = callback;

  let realtimeChannel;
  try {
    const supabase = createClient();
    realtimeChannel = supabase
      .channel(`storefront-products-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, callback);
    void realtimeChannel.subscribe();
  } catch (error) {
    console.warn("Supabase storefront realtime is unavailable; polling remains active.", error);
  }

  return () => {
    window.removeEventListener("storage", onStorage);
    broadcastChannel?.close();
    if (realtimeChannel) void realtimeChannel.unsubscribe();
  };
}
