"use client";

import { useState } from "react";
import { Eye, Heart, ShoppingCart, Star, StarHalf, Tag } from "lucide-react";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import Particles from "./Particles";
import { getProductPath } from "@/lib/productCatalog";

// All cap images from /public/products/Ismalic Caps/ folder
const capImages = [
  // Original collection (WA series)
  { src: "/products/Ismalic Caps/IMG-20230108-WA0009.jpg.jpeg", name: "Classic White Kufi", desc: "Traditional cotton kufi cap", tone: "from-stone-100 to-stone-300", category: "Classic" },
  { src: "/products/Ismalic Caps/IMG-20230108-WA0010.jpg.jpeg", name: "Embroidered Taqiyah", desc: "Gold thread embroidery detail", tone: "from-amber-100 to-amber-300", category: "Embroidered" },
  { src: "/products/Ismalic Caps/IMG-20230108-WA0016.jpg.jpeg", name: "Premium Barkati Cap", desc: "Handcrafted premium fabric", tone: "from-slate-200 to-slate-400", category: "Barkati" },
  { src: "/products/Ismalic Caps/IMG-20230108-WA0020.jpg.jpeg", name: "Designer Owaisi Cap", desc: "Modern fit with classic style", tone: "from-sky-100 to-sky-300", category: "Owaisi" },
  { src: "/products/Ismalic Caps/IMG-20230108-WA0022.jpg.jpeg", name: "Omani Style Cap", desc: "Traditional Omani design", tone: "from-stone-700 to-stone-900", category: "Omani" },
  { src: "/products/Ismalic Caps/IMG-20230108-WA0026.jpg.jpeg", name: "Jarkali Premium Cap", desc: "Distinctive peaked design", tone: "from-stone-200 to-stone-400", category: "Jarkali" },
  { src: "/products/Ismalic Caps/IMG-20230108-WA0029.jpg.jpeg", name: "Imama Shareef Style", desc: "Elegant turban-style cap", tone: "from-stone-100 to-stone-300", category: "Imama" },
  { src: "/products/Ismalic Caps/IMG-20230108-WA0031.jpg.jpeg", name: "Designer Collection 1", desc: "Exclusive designer pattern", tone: "from-stone-700 to-stone-900", category: "Designer" },
  { src: "/products/Ismalic Caps/IMG-20230108-WA0035.jpg.jpeg", name: "Designer Collection 2", desc: "Premium embroidered finish", tone: "from-amber-700 to-amber-950", category: "Designer" },
  { src: "/products/Ismalic Caps/IMG_20230331_213440.jpg.jpeg", name: "Designer Collection 3", desc: "Luxury fabric blend", tone: "from-stone-800 to-stone-950", category: "Designer" },
  { src: "/products/Ismalic Caps/IMG_20230331_214004.jpg.jpeg", name: "Designer Collection 4", desc: "Artisanal craftsmanship", tone: "from-slate-700 to-slate-900", category: "Designer" },
  { src: "/products/Ismalic Caps/IMG_20230331_214015.jpg.jpeg", name: "Designer Collection 5", desc: "Limited edition design", tone: "from-amber-800 to-stone-900", category: "Designer" },

  // 2025 collection
  { src: "/products/Ismalic Caps/IMG_20250131_233946_122 (1) (1).png", name: "Premium Velvet Cap", desc: "Luxury velvet finish", tone: "from-purple-800 to-purple-950", category: "Premium" },
  { src: "/products/Ismalic Caps/IMG_20250131_233946_122 (1) (2).png", name: "Royal Blue Taqiyah", desc: "Rich blue premium fabric", tone: "from-blue-700 to-blue-950", category: "Premium" },
  { src: "/products/Ismalic Caps/IMG_20250131_233946_122 (1) (3).png", name: "Gold Trimmed Kufi", desc: "Gold accent detailing", tone: "from-amber-600 to-amber-900", category: "Premium" },
  { src: "/products/Ismalic Caps/IMG_20250131_233946_122 (30) (1).png", name: "Designer Series A", desc: "Exclusive designer series", tone: "from-stone-700 to-stone-900", category: "Designer" },
  { src: "/products/Ismalic Caps/IMG_20250131_233946_122 (30).png", name: "Designer Series B", desc: "Exclusive designer series", tone: "from-slate-700 to-slate-900", category: "Designer" },
  { src: "/products/Ismalic Caps/IMG_20250131_233946_122 (31).png", name: "Designer Series C", desc: "Exclusive designer series", tone: "from-gray-700 to-gray-900", category: "Designer" },

  // December 2025 collection
  { src: "/products/Ismalic Caps/IMG_20251225_214159348 (1).png", name: "Winter Collection 1", desc: "Warm winter fabric", tone: "from-red-700 to-red-950", category: "Seasonal" },
  { src: "/products/Ismalic Caps/IMG_20251225_214159348 (2).png", name: "Winter Collection 2", desc: "Premium winter blend", tone: "from-rose-700 to-rose-950", category: "Seasonal" },
  { src: "/products/Ismalic Caps/IMG_20251225_214159348.png", name: "Winter Collection 3", desc: "Cozy winter design", tone: "from-amber-700 to-amber-950", category: "Seasonal" },
  { src: "/products/Ismalic Caps/IMG_20251225_214628925.png", name: "Festive Special", desc: "Eid festive design", tone: "from-emerald-700 to-emerald-950", category: "Festive" },

  // Photoroom collection (2026)
  { src: "/products/Ismalic Caps/Photoroom-20260115_203906723 (5).png", name: "Modern Minimalist", desc: "Clean modern design", tone: "from-stone-600 to-stone-800", category: "Modern" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_203906723 (6).png", name: "Contemporary Classic", desc: "Timeless contemporary", tone: "from-slate-600 to-slate-800", category: "Modern" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131.png", name: "Artisan Series 1", desc: "Handcrafted artisan", tone: "from-amber-600 to-amber-800", category: "Artisan" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131 (1).png", name: "Artisan Series 2", desc: "Handcrafted artisan", tone: "from-amber-700 to-amber-900", category: "Artisan" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131 (2).png", name: "Artisan Series 3", desc: "Handcrafted artisan", tone: "from-amber-800 to-amber-950", category: "Artisan" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131 (3).png", name: "Artisan Series 4", desc: "Handcrafted artisan", tone: "from-orange-600 to-orange-800", category: "Artisan" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131 (4).png", name: "Artisan Series 5", desc: "Handcrafted artisan", tone: "from-yellow-600 to-yellow-800", category: "Artisan" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131 (5).png", name: "Artisan Series 6", desc: "Handcrafted artisan", tone: "from-amber-500 to-amber-700", category: "Artisan" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131 (7).png", name: "Artisan Series 7", desc: "Handcrafted artisan", tone: "from-amber-600 to-amber-800", category: "Artisan" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131 (8).png", name: "Artisan Series 8", desc: "Handcrafted artisan", tone: "from-amber-700 to-amber-900", category: "Artisan" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131 (9).png", name: "Artisan Series 9", desc: "Handcrafted artisan", tone: "from-amber-800 to-amber-950", category: "Artisan" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131 (10).png", name: "Artisan Series 10", desc: "Handcrafted artisan", tone: "from-orange-700 to-orange-900", category: "Artisan" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131 (11).png", name: "Artisan Series 11", desc: "Handcrafted artisan", tone: "from-amber-600 to-amber-800", category: "Artisan" },
  { src: "/products/Ismalic Caps/Photoroom-20260115_210713131 (12).png", name: "Artisan Series 12", desc: "Handcrafted artisan", tone: "from-amber-700 to-amber-900", category: "Artisan" },

  // SIDRA BG collection
  { src: "/products/Ismalic Caps/SIDRA BG (2) (7).png", name: "Sidra Signature 1", desc: "Signature Sidra design", tone: "from-gold-600 to-gold-800", category: "Signature" },
  { src: "/products/Ismalic Caps/SIDRA BG (2) (14).png", name: "Sidra Signature 2", desc: "Signature Sidra design", tone: "from-gold-700 to-gold-900", category: "Signature" },
  { src: "/products/Ismalic Caps/SIDRA BG (2) (15).png", name: "Sidra Signature 3", desc: "Signature Sidra design", tone: "from-amber-700 to-amber-900", category: "Signature" },
  { src: "/products/Ismalic Caps/SIDRA BG (2) (16).png", name: "Sidra Signature 4", desc: "Signature Sidra design", tone: "from-yellow-700 to-yellow-900", category: "Signature" },
  { src: "/products/Ismalic Caps/SIDRA BG (2) (17).png", name: "Sidra Signature 5", desc: "Signature Sidra design", tone: "from-amber-600 to-amber-800", category: "Signature" },
  { src: "/products/Ismalic Caps/SIDRA BG (2) (20).png", name: "Sidra Signature 6", desc: "Signature Sidra design", tone: "from-gold-600 to-gold-800", category: "Signature" },
];

const prices = [299, 349, 399, 449, 499, 549, 599, 649, 699, 749, 799, 849];
const ratings = [4.5, 4.6, 4.7, 4.8, 4.5, 4.6, 4.7, 4.8, 4.9, 4.5, 4.6, 4.7];
const reviews = [120, 89, 156, 78, 203, 134, 97, 65, 43, 112, 87, 56, 234, 189, 167, 98, 76, 145, 210, 178];

const capProducts = capImages.map((img, i) => ({
  ...img,
  price: prices[i % prices.length],
  rating: ratings[i % ratings.length],
  reviews: reviews[i % reviews.length],
  badge: i === 0 ? "Best Seller" : i === 3 ? "New Arrival" : i === 7 ? "Limited" : i === 15 ? "Exclusive" : i === 25 ? "Featured" : null,
}));

function Stars({ value }) {
  return (
    <div className="flex items-center text-gold">
      {[1, 2, 3, 4, 5].map((i) => {
        if (value >= i) return <Star key={i} size={13} fill="currentColor" />;
        if (value >= i - 0.5) return <StarHalf key={i} size={13} fill="currentColor" />;
        return <Star key={i} size={13} className="text-stone-300" />;
      })}
    </div>
  );
}

export default function DesignerCaps() {
  const [wish, setWish] = useState(() => new Set());
  const [added, setAdded] = useState(() => new Set());
  const [showAll, setShowAll] = useState(false);

  const toggle = (setter, name, ms) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else {
        next.add(name);
        if (ms) setTimeout(() => setter((p) => { const n = new Set(p); n.delete(name); return n; }), ms);
      }
      return next;
    });

  const initialCount = 10;
  const displayProducts = showAll ? capProducts : capProducts.slice(0, initialCount);

  return (
    <section className="relative isolate overflow-hidden bg-cream py-20 lg:py-24">
      <Particles />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] animate-glow rounded-full bg-[radial-gradient(circle,rgba(232,189,109,0.28),transparent_65%)]" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-[460px] w-[460px] animate-glow rounded-full bg-[radial-gradient(circle,rgba(201,154,75,0.22),transparent_65%)] [animation-delay:2s]" />
      <span className="pointer-events-none absolute -top-6 right-6 hidden select-none font-serif text-[200px] font-bold leading-none text-gold/[0.06] lg:block">
        Caps
      </span>

      {/* Floating ornamental seal */}
      <div className="pointer-events-none absolute right-8 top-1/3 hidden h-[180px] w-[180px] animate-float lg:block">
        <svg viewBox="0 0 200 200" className="absolute inset-0 animate-spin-slow">
          <defs>
            <path id="capsSeal" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <text fontSize="14" fontWeight="500" fill="#E8BD6D" opacity="0.6">
            <textPath href="#capsSeal" textLength="486" lengthAdjust="spacing">
              ISLAMIC CAPS • DESIGNER COLLECTION • PREMIUM QUALITY •
            </textPath>
          </text>
        </svg>
      </div>

      <div className="container-site relative">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold-dark">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-dark" />
              Islamic Caps
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold text-ink lg:text-5xl">
              Designer <span className="text-shimmer-dark">Collection</span>
            </h2>
            <p className="mt-3 hidden max-w-[420px] text-base text-stone-500 sm:block">
              Handcrafted Islamic caps blending tradition with contemporary elegance. {capProducts.length} unique designs available.
            </p>
          </div>
        </Reveal>

        {/* Grid: 5 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {displayProducts.map((p, i) => {
            const liked = wish.has(p.name);
            const isAdded = added.has(p.name);
            return (
              <Reveal key={p.src} delay={i * 60}>
                <article className="group relative h-full select-none overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_-18px_rgba(21,16,12,0.35)] ring-1 ring-stone-200 transition duration-500 hover:-translate-y-3 hover:shadow-[0_34px_60px_-20px_rgba(201,154,75,0.6)] hover:ring-gold/70">
                  <SmartImage
                    src={p.src}
                    alt={p.name}
                    tone={p.tone}
                    className="h-[230px] w-full"
                    imgClassName="pointer-events-none h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  >
                    <a
                      href={getProductPath(p)}
                      aria-label={`View ${p.name} details`}
                      className="absolute inset-0 z-[1]"
                    />
                    {/* Depth gradient */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

                    {/* Category badge */}
                    <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-lg bg-white/90 text-stone-700 backdrop-blur-sm border border-gold/30">
                      {p.category}
                    </span>

                    {/* Rank badge */}
                    <span
                      className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-lg ${
                        p.badge === "Best Seller"
                          ? "bg-gradient-to-b from-gold-light to-gold text-ink"
                          : p.badge === "New Arrival"
                          ? "bg-gradient-to-b from-emerald-500 to-emerald-700 text-white"
                          : p.badge === "Limited"
                          ? "bg-gradient-to-b from-rose-500 to-rose-700 text-white"
                          : p.badge === "Exclusive"
                          ? "bg-gradient-to-b from-purple-500 to-purple-700 text-white"
                          : p.badge === "Featured"
                          ? "bg-gradient-to-b from-blue-500 to-blue-700 text-white"
                          : "bg-black/55 text-gold-light backdrop-blur-sm"
                      }`}
                    >
                      {p.badge === "Best Seller" && <Tag size={12} />}
                      {p.badge === "New Arrival" && <span className="text-[10px]">NEW</span>}
                      {p.badge === "Limited" && <span className="text-[10px]">LTD</span>}
                      {p.badge === "Exclusive" && <span className="text-[10px]">EXCL</span>}
                      {p.badge === "Featured" && <span className="text-[10px]">★</span>}
                      {!p.badge && `#${i + 1}`}
                    </span>

                    {/* Wishlist */}
                    <button
                      aria-label="Wishlist"
                      aria-pressed={liked}
                      onClick={(e) => { e.stopPropagation(); toggle(setWish, p.name); }}
                      className={`absolute right-3 top-36 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition duration-300 hover:scale-110 ${
                        liked ? "bg-red-500 text-white" : "bg-white/95 text-stone-600 hover:text-red-500"
                      }`}
                    >
                      <Heart size={16} fill={liked ? "currentColor" : "none"} className={liked ? "animate-bob" : ""} />
                    </button>

                    {/* Quick view slides up on hover */}
                    <a href={getProductPath(p)} className="absolute inset-x-4 bottom-4 z-10 flex translate-y-6 items-center justify-center gap-2 rounded-full bg-white/90 py-2 text-xs font-semibold text-ink opacity-0 shadow-lg backdrop-blur-sm transition duration-500 hover:bg-gold group-hover:translate-y-0 group-hover:opacity-100">
                      <Eye size={14} /> Quick View
                    </a>
                  </SmartImage>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold leading-tight text-ink line-clamp-1">
                        <a href={getProductPath(p)} className="transition hover:text-gold-dark">{p.name}</a>
                      </h3>
                      {p.badge && (
                        <span className="shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white bg-gradient-to-r from-gold-dark to-gold">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[13px] text-stone-500 line-clamp-1">{p.desc}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Stars value={p.rating} />
                      <span className="text-xs font-semibold text-ink">{p.rating}</span>
                      <span className="text-xs text-stone-400">({p.reviews})</span>
                    </div>
                    <p className="mt-2.5 text-2xl font-bold text-ink">
                      <span className="mr-0.5 text-lg font-semibold text-gold-dark">₹</span>
                      {p.price}
                    </p>
                    <button
                      onClick={() => toggle(setAdded, p.name, 1800)}
                      className={`btn-gold-sm relative mt-3 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3 text-[13px] font-semibold transition duration-300 ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-ink text-white hover:bg-gradient-to-b hover:from-gold-light hover:to-gold hover:text-ink"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <ShoppingCart size={16} className="rotate-90" /> Added to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={15} /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* View more / Show less button */}
        {!showAll && capProducts.length > initialCount && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="btn-gold inline-flex"
            >
              View All {capProducts.length} Caps
            </button>
          </div>
        )}
        {showAll && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll(false)}
              className="btn-gold inline-flex bg-ink hover:bg-gradient-to-b hover:from-gold-light hover:to-gold hover:text-ink"
            >
              Show Less ({initialCount} Caps)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
