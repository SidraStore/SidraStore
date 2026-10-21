"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import { shopCategories } from "@/lib/data";
import { useStorefrontCatalog } from "./useStorefrontData";

export default function ShopCategory() {
  const { categories, error: catalogError } = useStorefrontCatalog([]);
  const displayedCategories = categories.length ? categories.map((category) => {
    const existing = shopCategories.find((item) => item.name === category.name);
    return { name: category.name, img: category.image_url || existing?.img, tone: existing?.tone || "from-stone-600 to-ink", href: existing?.href || "/shop" };
  }) : shopCategories;
  const [wish, setWish] = useState(() => new Set());
  const toggle = (name) =>
    setWish((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  return (
    <section className="relative overflow-hidden bg-cream py-20 lg:py-24">
      {/* ambience */}
      <div className="pointer-events-none absolute -right-32 top-10 h-[440px] w-[440px] animate-glow rounded-full bg-[radial-gradient(circle,rgba(232,189,109,0.28),transparent_65%)]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[460px] w-[460px] animate-glow rounded-full bg-[radial-gradient(circle,rgba(201,154,75,0.22),transparent_65%)] [animation-delay:2s]" />
      <span className="pointer-events-none absolute -left-4 top-2 hidden select-none font-serif text-[190px] font-bold leading-none text-gold/[0.06] lg:block">
        Shop
      </span>

      <div className="container-site relative">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold-dark">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-dark" />
              Collections
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold text-ink lg:text-5xl">
              Shop by <span className="text-shimmer-dark">Category</span>
            </h2>
            <p className="mt-3 text-base text-stone-500">
              Explore our complete range of Islamic lifestyle products.
            </p>
          </div>
          <a
            href="/all-products"
            className="group flex items-center justify-center rounded-full border border-gold/60 bg-white px-5 py-3 text-center text-sm font-semibold text-ink shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-gold hover:shadow-lg"
          >
            View All Categories
          </a>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {displayedCategories.map((c, i) => {
            const liked = wish.has(c.name);
            return (
              <Reveal key={c.name} delay={(i % 5) * 100} from="zoom">
                <a
                  href={c.href}
                  className="group relative block h-[230px] overflow-hidden rounded-3xl shadow-[0_12px_30px_-16px_rgba(21,16,12,0.45)] ring-1 ring-stone-200 transition duration-500 hover:-translate-y-3 hover:shadow-[0_34px_60px_-20px_rgba(201,154,75,0.65)] hover:ring-2 hover:ring-gold sm:h-[290px]"
                >
                  <SmartImage
                    src={c.img}
                    alt={c.name}
                    tone={c.tone}
                    className="absolute inset-0"
                    imgClassName="h-full w-full object-cover transition duration-[900ms] group-hover:scale-110"
                  />

                  {/* readability gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/25 transition duration-500 group-hover:from-black/85" />
                  {/* light sweep on hover */}
                  <span className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-[900ms] group-hover:left-[130%] group-hover:opacity-100" />

                  {/* index */}
                  <span className="absolute left-4 top-4 font-serif text-lg font-semibold tracking-wide text-gold-light drop-shadow">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* wishlist */}
                  <button
                    aria-label="Wishlist"
                    aria-pressed={liked}
                    onClick={(e) => {
                      e.preventDefault();
                      toggle(c.name);
                    }}
                    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition duration-300 hover:scale-110 ${
                      liked ? "bg-red-500 text-white" : "bg-white/90 text-stone-600 hover:text-red-500"
                    }`}
                  >
                    <Heart size={16} fill={liked ? "currentColor" : "none"} />
                  </button>

                  {/* name + reveal line */}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="font-serif text-lg font-semibold leading-tight text-white drop-shadow sm:text-xl">
                      {c.name}
                    </h3>
                    <div className="mt-2 flex items-center">
                      <span className="flex translate-y-2 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-light opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        Explore
                      </span>
                    </div>
                    <span className="mt-3 block h-[2px] w-8 rounded-full bg-gold transition-all duration-500 group-hover:w-full" />
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
        {catalogError && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Category synchronization failed: {catalogError}</p>}
      </div>
    </section>
  );
}
