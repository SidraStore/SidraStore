"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { allProducts, createProductSlug } from "@/lib/productCatalog";
import { useStorefrontCatalog } from "./useStorefrontData";

const STORAGE_KEY = "sidra_store_cart";
const CartContext = createContext(null);

function normalizeCartItem(product, quantity) {
  const variant = product.variant;
  const variantKey = variant ? `-${variant.size}` : "";
  return {
    slug: createProductSlug(product.name) + variantKey,
    name: product.name + (variant ? ` (${variant.size})` : ""),
    price: Number(variant?.price ?? product.price),
    src: product.src,
    quantity: Math.max(1, Number(quantity) || 1),
    variant: variant ? { size: variant.size, price: variant.price } : null,
  };
}

export function CartProvider({ children }) {
  const { products: catalogProducts, error: catalogError } = useStorefrontCatalog(allProducts);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedItems = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(storedItems)) setItems(storedItems);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  useEffect(() => {
    if (!loaded || !catalogProducts.length) return;
    setItems((currentItems) => currentItems.flatMap((item) => {
      const product = catalogProducts.find((candidate) => (candidate.slug || createProductSlug(candidate.name)) === item.slug.replace(/-(6ml|12ml)$/, ""));
      if (!product) return [];
      const variant = item.variant ? product.variants?.find(v => v.size === item.variant.size) : null;
      if (!variant && product.variants?.length) return []; // Product now has variants but cart item doesn't specify one
      return [{ ...item, name: product.name + (variant ? ` (${variant.size})` : ""), price: Number(variant?.price ?? product.price), src: product.src, quantity: Math.min(item.quantity, variant?.stock ?? product.stockQuantity ?? item.quantity) }];
    }));
  }, [catalogProducts, loaded]);

  const addItem = useCallback((product, quantity = 1) => {
    const nextItem = normalizeCartItem(product, quantity);
    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.slug === nextItem.slug);
      if (!existing) return [...currentItems, nextItem];
      return currentItems.map((item) =>
        item.slug === nextItem.slug
          ? { ...item, quantity: item.quantity + nextItem.quantity }
          : item,
      );
    });
  }, []);

  const updateQuantity = useCallback((slug, quantity) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => item.slug === slug ? { ...item, quantity: Math.max(0, quantity) } : item)
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((slug) => {
    setItems((currentItems) => currentItems.filter((item) => item.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const value = useMemo(() => ({ items, itemCount, subtotal, catalogError, addItem, updateQuantity, removeItem, clearCart }), [items, itemCount, subtotal, catalogError, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider.");
  return context;
}
