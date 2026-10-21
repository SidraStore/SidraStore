"use client";

import { ShieldCheck, Truck, Users } from "lucide-react";
import SmartImage from "./SmartImage";
import Particles from "./Particles";
import Parallax from "./Parallax";
import Sparkles from "./Sparkles";
import { useStorefrontContent } from "./useStorefrontData";

const badges = [
  { icon: ShieldCheck, a: "100% Authentic", b: "Products" },
  { icon: Truck, a: "Fast & Secure", b: "Delivery" },
  { icon: Users, a: "Trusted by", b: "Thousands" },
];

const delay = (s) => ({ animationDelay: `${s}s` });

// gold hand-drawn underline that draws itself
function Underline({ className = "" }) {
  return (
    <>
      <svg
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
        fill="none"
        className={`overflow-visible drop-shadow-[0_0_6px_rgba(232,189,109,0.85)] ${className}`}
      >
        <defs>
          <linearGradient id="faith-ul" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#A87A32" stopOpacity="0" />
            <stop offset="0.2" stopColor="#E8BD6D" />
            <stop offset="0.5" stopColor="#FFF1C9" />
            <stop offset="0.8" stopColor="#E8BD6D" />
            <stop offset="1" stopColor="#A87A32" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* main flowing wave */}
        <path
          d="M2 11 C 40 1, 80 17, 100 10 C 120 3, 160 17, 198 8"
          stroke="url(#faith-ul)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="1"
          className="[animation:draw_1.4s_1.2s_ease-out_forwards]"
        />
        {/* thin echo line underneath */}
        <path
          d="M28 17 C 70 12, 130 12, 172 17"
          stroke="url(#faith-ul)"
          strokeWidth="1.2"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="1"
          className="[animation:draw_1.2s_1.8s_ease-out_forwards]"
        />
      </svg>
      {/* glowing diamond in the middle */}
      <span className="absolute left-1/2 top-full -mt-[7px] h-2 w-2 rotate-45 bg-gradient-to-br from-white to-gold-light opacity-0 shadow-[0_0_12px_3px_rgba(232,189,109,0.95)] [animation:popDiamond_0.6s_2.1s_ease-out_forwards]" />
    </>
  );
}

// "Tradition Meets Elegance" seal (desktop + mobile, sized by `className`)
function Seal({ className = "", text = "text-[11px]" }) {
  return (
    <div className={`animate-float items-center justify-center ${className}`}>
      <div className="absolute inset-0 rotate-45 rounded-[28px] border border-gold/70 bg-black/45 shadow-[0_0_40px_rgba(232,189,109,0.35)] backdrop-blur-sm" />
      <div className="absolute inset-0 rounded-full border border-gold/70 bg-black/35 backdrop-blur-sm" />
      <div className="absolute inset-2 animate-spin-slow rounded-full border border-dashed border-gold/50" />
      <p className={`relative text-center font-medium uppercase leading-relaxed tracking-[0.26em] text-gold-light ${text}`}>
        Tradition
        <br />
        <span className="my-0.5 block text-[8px] text-gold">✦</span>
        Meets
        <br />
        Elegance
      </p>
    </div>
  );
}

export default function Hero() {
  const { data: storefrontContent } = useStorefrontContent();
  const slide = storefrontContent.hero_slides[0];
  const heroTitle = slide?.title || "Fragrance Inspired by Faith";
  const titleWords = heroTitle.split(/\s+/);
  const highlightedWord = titleWords.pop();
  const titleLead = titleWords.join(" ");
  const heroDescription = slide?.subtitle || "Discover premium attars, Islamic caps, surma, prayer essentials and more — crafted for a meaningful everyday life.";
  const desktopImage = slide?.desktop_image_url || "/images/hero1.png";
  const mobileImage = slide?.mobile_image_url || desktopImage;
  const ctaLabel = slide?.cta_label || "Shop Collection";
  const ctaHref = slide?.cta_href || "/shop";
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      {/* ───────── desktop background — drifts opposite to the mouse ───────── */}
      <Parallax depth={18} className="absolute -inset-6 -z-30 hidden lg:block">
        <SmartImage
          src={desktopImage}
          tone="from-ink via-[#3a2410] to-[#8a5a2b]"
          imgClassName="h-full w-full animate-kenburns object-cover object-center"
          className="absolute inset-0"
        />
      </Parallax>

      {/* ───────── mobile background (heromobile.png, falls back to the desktop photo) ───────── */}
      <SmartImage
        src={mobileImage}
        alt="Sidra attars"
        tone="from-ink via-[#3a2410] to-[#8a5a2b]"
        imgClassName="h-full w-full animate-kenburns object-cover object-center"
        className="absolute inset-0 -z-30 lg:hidden"
        fallback={
          // eslint-disable-next-line @next/next/no-img-element
          <img src={desktopImage} alt="" className="h-full w-full object-cover object-[72%_center]" />
        }
      />

      {/* contrast */}
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-black/70 via-black/15 to-transparent lg:block" />
      <div className="absolute inset-0 -z-10 hidden bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)] lg:block" />
      <div className="absolute inset-x-0 bottom-0 -z-10 hidden h-40 bg-gradient-to-t from-black/60 to-transparent lg:block" />
      {/* mobile: dark at the top for the copy, clear in the middle for the bottles, dark at the bottom for the bar */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/75 via-black/10 to-black/70 lg:hidden" />

      {/* soft light rays falling from the arch */}
      <div className="pointer-events-none absolute -top-10 right-[16%] -z-10 hidden h-[110%] w-[34%] origin-top animate-ray bg-[linear-gradient(100deg,transparent_20%,rgba(255,214,150,0.22)_45%,transparent_70%)] mix-blend-screen blur-xl lg:block" />
      <div className="pointer-events-none absolute -top-10 right-[28%] -z-10 hidden h-[110%] w-[20%] origin-top animate-ray bg-[linear-gradient(100deg,transparent_20%,rgba(255,190,120,0.16)_50%,transparent_75%)] mix-blend-screen blur-2xl [animation-delay:3s] lg:block" />

      <Particles />
      <Sparkles />

      {/* ═════════════ MOBILE / TABLET layout ═════════════ */}
      <div className="relative mx-auto flex min-h-[720px] w-full max-w-[560px] flex-col items-center px-5 pb-28 pt-12 text-center sm:min-h-[820px] sm:pt-16 lg:hidden">
        <h1
          style={delay(0.15)}
          className="animate-fade-up font-serif text-[40px] font-semibold leading-[1.1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] sm:text-6xl"
        >
          {titleLead}
          <br />
          <span className="relative inline-block">
            <span className="text-shimmer">{highlightedWord}</span>
            <Underline className="absolute -bottom-2 left-0 h-4 w-full" />
          </span>
        </h1>

        <p
          style={delay(0.35)}
          className="mt-4 max-w-[330px] animate-fade-up text-[14.5px] leading-relaxed text-stone-100 drop-shadow sm:max-w-[420px] sm:text-base"
        >
          {heroDescription}
        </p>

        <a
          href={ctaHref}
          style={delay(0.5)}
          className="btn-gold mt-6 w-[170px] animate-fade-up !px-5 !py-3 !text-[14px]"
        >
          {ctaLabel}
        </a>

        {/* seal on the right, over the arch */}
        <Seal className="absolute right-2 top-[53%] flex h-[96px] w-[96px] sm:right-8 sm:h-[112px] sm:w-[112px]" text="text-[7.5px] sm:text-[8.5px]" />

        {/* glass trust bar along the bottom */}
        <div
          style={delay(0.85)}
          className="absolute inset-x-3 bottom-4 flex animate-fade-up divide-x divide-white/15 rounded-2xl border border-gold/25 bg-black/55 py-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md"
        >
          {badges.map(({ icon: Icon, a, b }) => (
            <div key={a} className="flex flex-1 flex-col items-center justify-center gap-1.5 px-1 text-center sm:flex-row sm:gap-2 sm:text-left">
              <Icon size={24} strokeWidth={1.4} className="shrink-0 text-gold-light" />
              <p className="text-[10.5px] leading-tight text-stone-100 sm:text-xs">
                {a}
                <br />
                {b}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ═════════════ DESKTOP layout ═════════════ */}
      <div className="relative hidden items-center lg:flex lg:h-[46.7vw] lg:max-h-[800px] lg:min-h-[680px] lg:pl-[7vw] lg:pr-10">
        <div className="max-w-[680px]">
          <p
            style={delay(0.1)}
            className="mb-6 flex animate-fade-up items-center gap-4 text-[13px] font-medium uppercase tracking-[0.32em] text-stone-100"
          >
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-light" />
            Premium Attar &amp; Islamic Lifestyle
          </p>

          <h1
            style={delay(0.25)}
            className="animate-fade-up font-serif text-[clamp(60px,6.1vw,92px)] font-semibold leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          >
            {titleLead}
            <br />
            <span className="relative inline-block">
              <span className="text-shimmer">{highlightedWord}</span>
              <Underline className="absolute -bottom-2.5 left-0 h-5 w-full" />
            </span>
          </h1>

          <p
            style={delay(0.45)}
            className="mt-7 max-w-[500px] animate-fade-up text-[17px] leading-relaxed text-stone-200"
          >
            {heroDescription}
          </p>

          <div style={delay(0.6)} className="mt-9 flex animate-fade-up flex-wrap items-center gap-5">
            <a href={ctaHref} className="btn-gold !px-7 !py-3.5 !text-[15px]">
              {ctaLabel}
            </a>
          </div>

          {/* glass trust pills */}
          <div style={delay(0.8)} className="mt-11 flex animate-fade-up flex-wrap gap-3">
            {badges.map(({ icon: Icon, a, b }) => (
              <div
                key={a}
                className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-2.5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:bg-white/[0.12]"
              >
                <Icon size={28} strokeWidth={1.4} className="text-gold-light transition group-hover:scale-110" />
                <p className="text-[13px] leading-tight text-stone-100">
                  {a}
                  <br />
                  {b}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Seal className="absolute right-[10%] top-[10%] flex h-[150px] w-[150px]" />
      </div>
    </section>
  );
}
