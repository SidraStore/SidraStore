"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { allProducts, createProductSlug } from "@/lib/productCatalog";
import { createClient } from "@/lib/supabase/client";
import { useStorefrontCatalog } from "./useStorefrontData";

const STORAGE_KEY = "sidra_store_cart";
const CartContext = createContext(null);

function normalizeCartItem(product, quantity) {
  const variant = product.variant;
  const productSlug = product.slug || createProductSlug(product.name);
  const variantKey = variant ? `-${variant.size}` : "";
  return {
    slug: productSlug + variantKey,
    productSlug,
    name: product.name + (variant ? ` (${variant.size})` : ""),
    price: Number(variant?.price ?? product.price),
    src: product.src,
    quantity: Math.max(1, Number(quantity) || 1),
    variant: variant ? { size: variant.size, price: variant.price } : null,
  };
}

function persistCart(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

async function recordAuthenticatedCartActivity(item, quantity) {
  const supabase = createClient();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error("Unable to verify the customer before recording cart activity.", userError);
    return;
  }
  if (!data.user) return;

  const { error } = await supabase.rpc("record_customer_cart_activity", {
    p_product_slug: item.productSlug,
    p_quantity: Math.min(25, Math.max(1, Math.floor(Number(quantity) || 1))),
    p_variant_size: item.variant?.size || null,
    p_event_id: window.crypto.randomUUID(),
  });
  if (error) {
    console.error("Unable to record authenticated cart activity.", error);
  }
}

export function CartProvider({ children }) {
  const { products: catalogProducts, error: catalogError, hasLoaded: hasCatalogLoaded } = useStorefrontCatalog(allProducts);
  const [items, setItems] = useState([]);
  const itemsRef = useRef([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedItems = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(storedItems)) {
        itemsRef.current = storedItems;
        setItems(storedItems);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !hasCatalogLoaded) return;
    const currentItems = itemsRef.current;
    const nextItems = currentItems.map((item) => {
        const itemProductSlug = item.productSlug || item.slug.replace(/-(6ml|12ml)$/, "");
        const product = catalogProducts.find(
          (candidate) => (candidate.slug || createProductSlug(candidate.name)) === itemProductSlug,
        );

        if (!product) return null;

        const variant = item.variant
          ? product.variants?.find((candidate) => candidate.size === item.variant.size)
          : null;
        const availableStock = variant?.stock ?? product.stockQuantity;
        const quantity = Number.isFinite(availableStock)
          ? Math.min(Math.max(0, Math.floor(Number(item.quantity) || 0)), Math.max(0, Math.floor(availableStock)))
          : Math.max(0, Math.floor(Number(item.quantity) || 0));

        return quantity > 0 ? {
          ...item,
          productSlug: itemProductSlug,
          name: product.name + (variant ? ` (${variant.size})` : ""),
          price: Number(variant?.price ?? product.price),
          src: product.src,
          quantity,
        } : null;
    }).filter(Boolean);

    if (JSON.stringify(nextItems) !== JSON.stringify(currentItems)) {
      itemsRef.current = nextItems;
      persistCart(nextItems);
      setItems(nextItems);
    }
  }, [catalogProducts, hasCatalogLoaded, loaded]);

  const addItem = useCallback((product, quantity = 1) => {
    const nextItem = normalizeCartItem(product, quantity);
    const currentItems = itemsRef.current;
    const existing = currentItems.find((item) => item.slug === nextItem.slug);
    const liveProduct = catalogProducts.find(
      (candidate) => (candidate.slug || createProductSlug(candidate.name)) === nextItem.productSlug,
    );
    const liveVariant = liveProduct && nextItem.variant
      ? liveProduct.variants?.find((candidate) => candidate.size === nextItem.variant.size)
      : null;
    const availableStock = liveVariant?.stock ?? liveProduct?.stockQuantity;
    const requestedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
    if (Number.isFinite(availableStock) && availableStock <= 0) return;
    const quantityToAdd = Number.isFinite(availableStock)
      ? Math.min(requestedQuantity, Math.max(0, Math.floor(availableStock) - (existing?.quantity || 0)))
      : requestedQuantity;
    if (quantityToAdd <= 0) return;
    const nextItems = !existing ? [...currentItems, nextItem] : currentItems.map((item) =>
      item.slug === nextItem.slug
        ? { ...item, quantity: item.quantity + quantityToAdd }
        : item,
    );
    if (!existing) nextItem.quantity = quantityToAdd;
    itemsRef.current = nextItems;
    persistCart(nextItems);
    setItems(nextItems);

    void recordAuthenticatedCartActivity(nextItem, nextItem.quantity).catch((error) => {
      console.error("Unable to record authenticated cart activity.", error);
    });
  }, [catalogProducts]);

  const updateQuantity = useCallback((slug, quantity) => {
    const nextItems = itemsRef.current
      .map((item) => {
        if (item.slug !== slug) return item;
        const product = catalogProducts.find(
          (candidate) => (candidate.slug || createProductSlug(candidate.name)) === (item.productSlug || item.slug.replace(/-(6ml|12ml)$/, "")),
        );
        const variant = product && item.variant
          ? product.variants?.find((candidate) => candidate.size === item.variant.size)
          : null;
        const availableStock = variant?.stock ?? product?.stockQuantity;
        const requestedQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
        const safeQuantity = Number.isFinite(availableStock)
          ? Math.min(requestedQuantity, Math.max(0, Math.floor(availableStock)))
          : requestedQuantity;
        return { ...item, quantity: safeQuantity };
      })
      .filter((item) => item.quantity > 0);
    itemsRef.current = nextItems;
    persistCart(nextItems);
    setItems(nextItems);
  }, [catalogProducts]);

  const removeItem = useCallback((slug) => {
    const nextItems = itemsRef.current.filter((item) => item.slug !== slug);
    itemsRef.current = nextItems;
    persistCart(nextItems);
    setItems(nextItems);
  }, []);

  const clearCart = useCallback(() => {
    itemsRef.current = [];
    persistCart([]);
    setItems([]);
  }, []);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const value = useMemo(
    () => ({ items, itemCount, subtotal, catalogProducts, catalogError, addItem, updateQuantity, removeItem, clearCart }),
    [items, itemCount, subtotal, catalogProducts, catalogError, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider.");
  return context;
}
