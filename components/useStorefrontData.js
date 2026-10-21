"use client";

import { useCallback, useEffect, useState } from "react";
import { subscribeToStorefrontUpdates } from "@/lib/storefrontSync";

export function mapStorefrontProduct(product) {
  return {
    id: product.id,
    slug: product.slug,
    src: product.image_url,
    name: product.name,
    desc: product.short_description,
    description: product.description,
    price: Number(product.price),
    stockQuantity: Number(product.stock_quantity),
    rating: Number(product.rating),
    reviews: Number(product.review_count),
    category: product.categories?.name || "Uncategorized",
    categorySlug: product.categories?.slug,
    subCategory: product.subcategories?.name || "General",
    badge: product.badge,
    tone: "from-stone-200 to-cream",
  };
}

function useLiveEndpoint(url, initialValue) {
  const [data, setData] = useState(initialValue);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    const response = await fetch(url, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Unable to load ${url}.`);
    setData(result);
    setError("");
  }, [url]);

  useEffect(() => {
    let mounted = true;
    const update = () => refresh().catch((requestError) => { if (mounted) setError(requestError.message); });
    update();
    const unsubscribe = subscribeToStorefrontUpdates(update);
    const interval = window.setInterval(update, 10000);
    return () => { mounted = false; unsubscribe(); window.clearInterval(interval); };
  }, [refresh]);
  return { data, error, refresh };
}

export function useStorefrontCatalog(initialProducts) {
  const { data, error, refresh } = useLiveEndpoint("/api/storefront/catalog", { products: [], categories: [] });
  return { products: data.products.length ? data.products.map(mapStorefrontProduct) : initialProducts, categories: data.categories, error, refresh };
}

export function useStorefrontContent() {
  return useLiveEndpoint("/api/storefront/content", { hero_slides: [], announcements: [], delivery_settings: null, faqs: [] });
}
