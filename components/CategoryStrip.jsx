"use client";

import { useRef } from "react";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import { useStorefrontCategories } from "./useStorefrontData";

const fallbackImages = {
  "attar-and-fragrances": "/products/attar-fragrances/attar.jpg",
  "islamic-caps": "/products/islamic-caps/IMG-20230108-WA0009.jpg.jpeg",
  surma: "/products/surma/surma.jpg",
  "prayer-essentials": "/products/prayer-essentials/ja-namaz.jpg",
  "islamic-wear": "/products/islamic-wear/ajrak-chadar.jpg",
  "gifts-and-combos": "/products/gifts-combos/attar.jpg",
};

const fallbackTones = {
  "attar-and-fragrances": "from-amber-700 to-amber-950",
  "islamic-caps": "from-stone-100 to-stone-300",
  surma: "from-amber-800 to-stone-900",
  "prayer-essentials": "from-blue-700 to-blue-950",
  "islamic-wear": "from-red-800 to-red-950",
  "gifts-and-combos": "from-amber-700 to-amber-950",
};

const allProductsCard = {
  name: "All Products",
  href: "/shop",
  img: "/products/attar-fragrances/sidra-oudh.jpg",
  tone: "from-emerald-900 to-stone-900",
};

function slugify(value) {
  return String(value || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CategoryStrip({ initialCategories }) {
  const ref = useRef(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const { categories } = useStorefrontCategories(initialCategories);
  const categoryCards = categories.map((category) => {
    const slug = category.slug || slugify(category.name);
    return {
      name: category.name,
      href: `/shop?category=${encodeURIComponent(slug)}`,
      img: category.image_url || fallbackImages[slug],
      tone: fallbackTones[slug] || "from-stone-200 to-cream",
    };
  });
  const cards = [...categoryCards, allProductsCard];

  // finger swipe is native; this adds click-and-drag for mouse users
  const onDown = (e) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    el.style.scrollSnapType = "none";
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    ref.current.scrollLeft = d.startLeft - dx;
  };
  const onUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    ref.current.style.scrollSnapType = "";
  };
  // don't follow the link if the user was dragging
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <section id="categories" className="bg-gradient-to-b from-[#f6ece0] to-cream-dark/70 py-8">
      <div className="container-site">
        <div
          ref={ref}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
          className="no-scrollbar -mx-4 flex touch-pan-x snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-3 pt-1 [-webkit-overflow-scrolling:touch] sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-7 lg:gap-3 lg:overflow-visible lg:px-0"
        >
          {cards.map((c, i) => (
            <Reveal
              key={c.name}
              from="zoom"
              delay={i * 60}
              className="w-[118px] shrink-0 snap-start sm:w-[130px] lg:w-auto"
            >
              <a
                href={c.href}
                draggable={false}
                className="group block select-none overflow-hidden rounded-[22px] border border-white/80 bg-white/70 p-1.5 shadow-[0_6px_18px_-10px_rgba(21,16,12,0.35)] backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-gold/70 hover:bg-white hover:shadow-[0_20px_36px_-14px_rgba(201,154,75,0.65)]"
              >
                {/* arch-shaped image: fully rounded top, softly rounded bottom */}
                <SmartImage
                  src={c.img}
                  alt={c.name}
                  tone={c.tone}
                  className="aspect-[4/4.4] w-full rounded-t-[999px] rounded-b-[16px]"
                  imgClassName="pointer-events-none h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <p className="flex min-h-[40px] items-center justify-center px-1 pb-1 pt-2 text-center text-[11.5px] font-bold leading-tight text-ink transition group-hover:text-gold-dark sm:text-xs">
                  {c.name}
                </p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
