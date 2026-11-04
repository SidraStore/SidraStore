"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Heart, X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import { useCart } from "./CartProvider";
import { useWishlist } from "./WishlistProvider";
import ProductSearch from "./ProductSearch";

// Slide-in drawer used for the mobile / tablet navigation (light theme).
export default function MobileSidebar({ open, onClose, items, categoryItems = [], categoriesLoading = false }) {
  const [expanded, setExpanded] = useState(null);
  const [shopExpanded, setShopExpanded] = useState(false);
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  // lock page scroll while open, close on Esc
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // collapse accordions when the drawer closes
  useEffect(() => {
    if (!open) {
      setExpanded(null);
      setShopExpanded(false);
    }
  }, [open]);

  function categoryId(item) {
    return `category-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  }

  function renderCategoryItems(list) {
    return (
      <div className="grid grid-cols-2 gap-2 max-[360px]:grid-cols-1">
        {list.map((item) => {
          const itemKey = categoryId(item);
          const hasChildren = item.children?.length > 0;
          const isOpen = expanded === itemKey;

          return (
            <div key={itemKey} className={isOpen ? "col-span-2 max-[360px]:col-span-1" : "min-w-0"}>
              <div className={`flex min-h-12 items-stretch overflow-hidden rounded-xl border transition ${isOpen ? "border-gold/60 bg-white shadow-sm" : "border-gold/20 bg-white/65"}`}>
                <Link
                  href={item.href || "#"}
                  onClick={onClose}
                  className="flex min-w-0 flex-1 items-center px-3 py-2.5 text-[12.5px] font-semibold leading-snug transition hover:text-gold-dark"
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : itemKey)}
                    aria-expanded={isOpen}
                    aria-controls={`${itemKey}-subcategories`}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label} subcategories`}
                    className={`flex min-h-12 w-10 shrink-0 items-center justify-center border-l border-gold/15 text-gold-dark transition hover:bg-gold/10 ${isOpen ? "bg-gold/10" : ""}`}
                  >
                    <ChevronDown size={16} className={`transition duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>

              {hasChildren && (
                <div
                  id={`${itemKey}-subcategories`}
                  className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "mt-1 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <ul className="grid grid-cols-2 gap-1 rounded-xl border border-gold/15 bg-white/70 p-2">
                      {item.children.map((child) => (
                        <li key={child.name}>
                          <Link
                            href={child.href}
                            onClick={onClose}
                            className="flex min-h-9 items-center rounded-lg px-2 text-[12px] leading-tight text-stone-600 transition hover:bg-cream hover:text-gold-dark"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="xl:hidden" aria-hidden={!open}>
      {/* backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-0 z-[70] flex h-dvh w-screen max-w-none flex-col overflow-hidden bg-gradient-to-b from-white via-cream to-cream-dark text-ink shadow-[-30px_0_80px_-10px_rgba(21,16,12,0.45)] transition-transform duration-500 ease-[cubic-bezier(.22,.8,.2,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* decoration */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 animate-glow rounded-full bg-[radial-gradient(circle,rgba(232,189,109,0.4),transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 animate-glow rounded-full bg-[radial-gradient(circle,rgba(201,154,75,0.25),transparent_65%)]" />
        <span className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-gold-dark via-gold-light to-gold-dark" />

        {/* top: logo + close */}
        <div className="relative flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
          <Logo className="h-9" />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-white text-gold-dark shadow-sm transition duration-300 hover:rotate-90 hover:bg-gold hover:text-ink"
          >
            <X size={22} />
          </button>
        </div>
        <span className="relative mx-5 h-px bg-gradient-to-r from-gold via-gold/40 to-transparent" />

        {/* compact body; the collection area gets the remaining height */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-3 pt-3 no-scrollbar">
          <div className="shrink-0">
            {open && <ProductSearch expanded onNavigate={onClose} />}
          </div>

          {/* links */}
          <nav className="mt-3 shrink-0 border-y border-stone-200/80" aria-label="Primary navigation">
            {items.map((item, index) => (
              item.label === "Shop" ? (
                <div
                  key={item.label}
                  style={{ transitionDelay: open ? `${150 + index * 45}ms` : "0ms" }}
                  className={`border-b border-stone-200/80 transition-all duration-500 ${
                    open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setShopExpanded((value) => !value)}
                    aria-expanded={shopExpanded}
                    aria-controls="mobile-shop-collections"
                    aria-label={`${shopExpanded ? "Collapse" : "Expand"} shop categories`}
                    className="flex min-h-12 w-full items-center justify-between py-2.5 text-left text-[15px] font-semibold leading-snug transition hover:text-gold-dark"
                  >
                    <span>{item.label}</span>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gold-dark transition hover:bg-gold/10 ${shopExpanded ? "bg-gold/10" : ""}`}>
                      <ChevronDown size={18} className={`transition duration-300 ${shopExpanded ? "rotate-180" : ""}`} />
                    </span>
                  </button>

                  <div
                    id="mobile-shop-collections"
                    className={`grid transition-[grid-template-rows] duration-300 ${shopExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <section className="pb-4" aria-labelledby="mobile-collections-heading">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-gold-dark">Explore</p>
                            <h2 id="mobile-collections-heading" className="mt-0.5 font-serif text-lg font-semibold leading-tight text-ink">Shop by collection</h2>
                          </div>
                          <Link href="/shop" onClick={onClose} className="rounded-full px-2 py-1.5 text-xs font-semibold text-gold-dark transition hover:bg-gold/10 hover:text-ink">
                            View all
                          </Link>
                        </div>
                        {categoriesLoading ? (
                          <div className="mt-2 grid grid-cols-2 gap-2" aria-live="polite" aria-label="Loading product categories">
                            {[0, 1, 2, 3, 4, 5].map((skeleton) => <div key={skeleton} className="h-11 animate-pulse rounded-xl bg-white/70" />)}
                          </div>
                        ) : (
                          <nav className="mt-2" aria-label="Product categories">
                            {renderCategoryItems(categoryItems)}
                          </nav>
                        )}
                      </section>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href || "#"}
                  onClick={onClose}
                  style={{ transitionDelay: open ? `${150 + index * 45}ms` : "0ms" }}
                  className={`flex min-h-12 min-w-0 items-center gap-1.5 border-b border-stone-200/80 py-2.5 text-[15px] font-semibold leading-snug transition-all duration-500 hover:text-gold-dark ${
                    open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                  } ${index === items.length - 1 ? "border-b-0" : ""}`}
                >
                  <span className="min-w-0 flex-1 whitespace-normal break-words">{item.label}</span>
                  {item.badge && (
                    <span className="mt-0.5 shrink-0 rounded-full bg-gradient-to-b from-gold-light to-gold px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none text-ink">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            ))}
          </nav>
        </div>

        {/* bottom: fixed actions */}
        <div className="relative flex shrink-0 flex-col gap-2.5 border-t border-gold/30 bg-white/85 px-5 pb-5 pt-4 backdrop-blur-sm" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
          <a href="/cart" onClick={onClose} className="group relative flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink pl-6 pr-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(21,16,12,0.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-gradient-to-b hover:from-gold-light hover:to-gold hover:text-ink">
            <ShoppingBag size={18} className="text-gold-light transition group-hover:text-ink" />
            <span>Cart</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold text-xs font-bold text-ink transition group-hover:bg-ink group-hover:text-gold-light">
              {itemCount}
            </span>
          </a>
          <a href="/wishlist" onClick={onClose} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-white text-sm font-semibold text-ink transition hover:border-gold hover:bg-gold/10">
            <Heart size={17} fill={wishlistCount ? "currentColor" : "none"} className={wishlistCount ? "text-red-500" : "text-gold-dark"} />
            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </a>
          <a href="/all-products" onClick={onClose} className="btn-gold min-h-12 w-full !py-3 !text-[15px]">
            Shop Collection
          </a>

        </div>
      </aside>
    </div>
  );
}
