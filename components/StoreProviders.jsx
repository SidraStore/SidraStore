"use client";

import { CartProvider } from "./CartProvider";

export default function StoreProviders({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
