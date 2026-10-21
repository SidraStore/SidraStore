"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { subscribeToStorefrontUpdates } from "@/lib/storefrontSync";

function getProductKey(product) {
  return String(product.slug || product.name || "").trim().toLowerCase();
}

export function mapStorefrontProduct(product, fallbackProduct) {
  return {
    id: product.id,
    slug: product.slug,
    src: product.image_url,
    galleryUrls: Array.isArray(product.gallery_urls) ? product.gallery_urls : [],
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
    variants: Array.isArray(product.variants) ? product.variants : (fallbackProduct?.variants || []),
    tone: fallbackProduct?.tone || "from-stone-200 to-cream",
  };
}

function useLiveEndpoint(url, initialValue) {
  const [data, setData] = useState(initialValue);
  const [error, setError] = useState("");
  const dataSignatureRef = useRef(JSON.stringify(initialValue));
  const refresh = useCallback(async () => {
    const response = await fetch(url, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Unable to load ${url}.`);
    const nextSignature = JSON.stringify(result);
    if (nextSignature !== dataSignatureRef.current) {
      dataSignatureRef.current = nextSignature;
      setData(result);
    }
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
  const initialProductsRef = useRef(initialProducts);
  const { data, error, refresh } = useLiveEndpoint("/api/storefront/catalog", { products: [], categories: [] });
  const products = useMemo(
    () => {
      const fallbackProducts = initialProductsRef.current;
      if (!data.products.length) return fallbackProducts;

      const fallbackByKey = new Map(fallbackProducts.map((product) => [getProductKey(product), product]));
      const fallbackOrder = new Map(fallbackProducts.map((product, index) => [getProductKey(product), index]));
      const seenProducts = new Set();

      return data.products
        .map((product) => mapStorefrontProduct(product, fallbackByKey.get(getProductKey(product))))
        .filter((product) => {
          const key = getProductKey(product);
          if (!key || seenProducts.has(key)) return false;
          seenProducts.add(key);
          return true;
        })
        .sort((first, second) => {
          const firstIndex = fallbackOrder.get(getProductKey(first)) ?? Number.MAX_SAFE_INTEGER;
          const secondIndex = fallbackOrder.get(getProductKey(second)) ?? Number.MAX_SAFE_INTEGER;
          return firstIndex - secondIndex;
        });
    },
    [data.products],
  );
  return { products, categories: data.categories, error, refresh };
}

export function useStorefrontContent() {
  return useLiveEndpoint("/api/storefront/content", { hero_slides: [], announcements: [], delivery_settings: null, faqs: [] });
}
