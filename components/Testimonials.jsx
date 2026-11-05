"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Quote, ShoppingBag, Star, StarHalf } from "lucide-react";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import { subscribeToStorefrontUpdates } from "@/lib/storefrontSync";

const SPEED = 45;
const STEP = 400; // px moved by an arrow click

const normalizeTime = (time, duration) => ((time % duration) + duration) % duration;

function Stars({ value }) {
  return (
    <div className="flex text-gold">
      {[1, 2, 3, 4, 5].map((i) =>
        value >= i ? (
          <Star key={i} size={17} fill="currentColor" />
        ) : value >= i - 0.5 ? (
          <StarHalf key={i} size={17} fill="currentColor" />
        ) : (
          <Star key={i} size={17} className="text-stone-300" />
        )
      )}
    </div>
  );
}

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

function Card({ t }) {
  return (
    <article className="group relative h-full overflow-hidden rounded-3xl border border-stone-200/80 bg-white/90 p-5 text-left sm:p-7 shadow-[0_10px_40px_-18px_rgba(21,16,12,0.25)] backdrop-blur transition duration-500 hover:-translate-y-2 hover:border-gold/60 hover:shadow-[0_28px_60px_-18px_rgba(201,154,75,0.55)]">
      {/* hover glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(232,189,109,0.35),transparent_65%)] opacity-0 transition duration-500 group-hover:opacity-100" />
      <Quote
        size={64}
        fill="currentColor"
        className="absolute right-5 top-5 text-gold/15 transition duration-500 group-hover:rotate-6 group-hover:text-gold/30"
      />

      <div className="relative flex items-center justify-between">
        <Stars value={t.rating} />
      </div>

      <p className="relative mt-4 min-h-[96px] text-base leading-relaxed sm:mt-5 sm:min-h-[104px] sm:text-[17px] text-stone-700">
        “{t.text}”
      </p>

      <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs font-medium text-gold-dark ring-1 ring-gold/30">
        <ShoppingBag size={12} /> {t.product}
      </span>

      <div className="relative mt-5 flex items-center gap-4 border-t border-stone-200 pt-5">
        <SmartImage
          src={t.img}
          alt={t.name}
          tone="from-gold-light to-gold-dark"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-2 ring-gold/60 ring-offset-2"
          fallback={
            <span className="text-base font-bold tracking-wide text-ink">{initials(t.name)}</span>
          }
        />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-base font-bold text-ink">
            <span className="truncate">{t.name}</span>
            <BadgeCheck size={17} className="shrink-0 text-gold-dark" />
          </p>
      <p className="text-sm text-stone-500">{t.place || "Verified customer review"}</p>
        </div>
      </div>
    </article>
  );
}

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);
  const s = useRef({ animation: null, duration: 0, half: 0, dragging: false, startX: 0, startTime: 0 });

  useEffect(() => {
    let mounted = true;
    const loadReviews = async () => {
      try {
        const response = await fetch("/api/storefront/reviews", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load customer reviews.");
        if (mounted) setReviews(result.reviews || []);
      } catch {
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadReviews();
    const unsubscribe = subscribeToStorefrontUpdates(loadReviews);
    const interval = window.setInterval(loadReviews, 10000);
    return () => {
      mounted = false;
      unsubscribe();
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const st = s.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const measure = () => (st.half = track.scrollWidth / 2);
    measure();
    st.duration = Math.max(12000, (st.half / SPEED) * 1000);
    window.addEventListener("resize", measure);

    const animation = reduced
      ? null
      : track.animate(
          [
            { transform: "translate3d(0, 0, 0)" },
            { transform: "translate3d(-50%, 0, 0)" },
          ],
          { duration: st.duration, easing: "linear", iterations: Infinity },
        );
    st.animation = animation;

    return () => {
      animation?.cancel();
      if (st.animation === animation) st.animation = null;
      window.removeEventListener("resize", measure);
    };
  }, [reviews.length]);

  const go = (dir) => {
    const st = s.current;
    if (!st.animation || !st.half) return;
    const currentTime = Number(st.animation.currentTime || 0);
    st.animation.currentTime = normalizeTime(currentTime + (dir * STEP * st.duration) / st.half, st.duration);
  };

  const onDown = (e) => {
    const st = s.current;
    st.animation?.pause();
    st.dragging = true;
    st.startX = e.clientX;
    st.startTime = Number(st.animation?.currentTime || 0);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const st = s.current;
    if (st.dragging && st.animation && st.half) {
      st.animation.currentTime = normalizeTime(st.startTime - ((e.clientX - st.startX) * st.duration) / st.half, st.duration);
    }
  };
  const onUp = () => {
    const st = s.current;
    st.dragging = false;
    st.animation?.play();
  };

  if (loading) return <section className="bg-cream py-16 text-center text-sm text-stone-500 sm:py-24">Loading customer reviews...</section>;
  if (!reviews.length) return <section className="bg-cream py-16 text-center text-sm text-stone-500 sm:py-24">No approved customer reviews yet.</section>;

  const items = [...reviews, ...reviews];

  return (
    <section className="relative overflow-hidden bg-cream py-16 sm:py-24">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 animate-glow rounded-full bg-[radial-gradient(circle,rgba(232,189,109,0.25),transparent_65%)]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 animate-glow rounded-full bg-[radial-gradient(circle,rgba(201,154,75,0.2),transparent_65%)]" />

      <div className="container-site text-center">
        <Reveal>
          <p className="flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold-dark">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-dark" />
            Testimonials
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-dark" />
          </p>
          <h2 className="mt-4 font-serif text-4xl font-semibold text-ink lg:text-5xl">
            What Our <span className="text-shimmer-dark">Customers</span> Say
          </h2>
          <p className="mt-3 text-base text-stone-500">
            Trusted by many for our authentic products and quality service.
          </p>
        </Reveal>
      </div>

      {/* infinite auto-scrolling track (hover to pause, drag / arrows to move) */}
      <div className="relative mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-cream to-transparent sm:w-48" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-cream to-transparent sm:w-48" />

        <button
          aria-label="Previous"
          onClick={() => go(-1)}
          className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-stone-300 bg-white shadow-lg transition hover:scale-110 hover:border-gold hover:bg-gold md:flex lg:left-10"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          aria-label="Next"
          onClick={() => go(1)}
          className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-stone-300 bg-white shadow-lg transition hover:scale-110 hover:border-gold hover:bg-gold md:flex lg:right-10"
        >
          <ChevronRight size={22} />
        </button>

        <div
          className="cursor-grab touch-pan-y select-none overflow-hidden py-6 active:cursor-grabbing"
          onMouseEnter={() => s.current.animation?.pause()}
          onMouseLeave={() => { if (!s.current.dragging) s.current.animation?.play(); }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onDragStart={(e) => e.preventDefault()}
        >
          <div ref={trackRef} className="flex w-max will-change-transform">
            {items.map((t, i) => (
              <div key={i} className="w-[84vw] max-w-[400px] shrink-0 pr-4 sm:w-[400px] sm:pr-6">
                <Card t={t} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
