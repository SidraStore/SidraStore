import { BadgeCheck, Gem, Landmark, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import Particles from "./Particles";

const features = [
  { icon: BadgeCheck, a: "Authentic", b: "Sourcing" },
  { icon: Gem, a: "Quality", b: "Assured" },
  { icon: Landmark, a: "Islamic", b: "Heritage" },
  { icon: Globe2, a: "Serving", b: "Across India" },
];

export default function Lifestyle() {
  return (
    <section className="relative grid overflow-hidden bg-cream lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr]">
      {/* ───────── image side ───────── */}
      <SmartImage
        src="/images/lifestyle.png"
        tone="from-[#d79b6b] via-[#8a5d4a] to-[#3b2a2a]"
        imgClassName="h-full w-full animate-kenburns object-cover object-[center_62%]"
        className="min-h-[380px]"
      >
        {/* sunset glow pulsing over the sun */}
        <div className="pointer-events-none absolute right-[22%] top-[42%] h-72 w-72 animate-glow rounded-full bg-[radial-gradient(circle,rgba(255,210,140,0.55),transparent_65%)] mix-blend-screen" />
        <Particles />

        {/* fade into cream */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[45%] bg-gradient-to-r from-transparent via-cream/60 to-cream lg:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-cream lg:hidden" />

        {/* floating glass card */}
        <div className="absolute left-5 top-6 hidden animate-float items-center gap-3 rounded-2xl border border-white/40 bg-white/20 px-4 py-3 shadow-2xl backdrop-blur-md sm:flex lg:left-10 lg:top-10">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold text-ink">
            <ShieldCheck size={22} />
          </span>
          <p className="text-[13px] font-semibold leading-tight text-white drop-shadow">
            100% Authentic
            <br />
            <span className="font-normal text-white/85">Handpicked Products</span>
          </p>
        </div>

        {/* rotating text seal */}
        <div className="absolute bottom-8 left-1/2 hidden h-[130px] w-[130px] -translate-x-1/2 items-center justify-center rounded-full bg-ink/70 shadow-2xl backdrop-blur-sm lg:flex xl:left-auto xl:right-[24%] xl:translate-x-0">
          <svg viewBox="0 0 200 200" className="absolute inset-0 animate-spin-slow">
            <defs>
              <path id="seal" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text fontSize="15" fontWeight="600" fill="#E8BD6D">
              <textPath href="#seal" textLength="486" lengthAdjust="spacing">
                AUTHENTIC • HERITAGE • QUALITY • FAITH •
              </textPath>
            </text>
          </svg>
          <Sparkles size={26} className="text-gold-light" />
        </div>
      </SmartImage>

      {/* ───────── text side ───────── */}
      <div className="relative flex items-center px-5 py-12 sm:px-8 sm:py-16 lg:px-20 lg:py-20">
        {/* soft decorative glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 animate-glow rounded-full bg-[radial-gradient(circle,rgba(232,189,109,0.35),transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 animate-glow rounded-full bg-[radial-gradient(circle,rgba(201,154,75,0.22),transparent_65%)]" />
        {/* faint watermark */}
        <span className="pointer-events-none absolute -right-4 bottom-2 hidden select-none sm:block font-serif text-[170px] font-bold leading-none text-gold/[0.07]">
          Faith
        </span>

        <Reveal from="right" className="relative max-w-[600px]">
          <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold-dark">
            <span className="h-px w-12 bg-gradient-to-r from-gold-dark to-transparent" />
            More Than Products
          </p>
          <h2 className="mt-4 font-serif text-[38px] font-semibold leading-[1.12] text-ink sm:mt-5 sm:text-5xl lg:text-[60px]">
            A Lifestyle
            <br />
            Closer to Your{" "}
            <span className="relative inline-block">
              <span className="text-shimmer-dark">Faith</span>
              <svg
                viewBox="0 0 200 12"
                className="absolute -bottom-2 left-0 w-full"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 C 50 -2, 150 -2, 198 8"
                  stroke="#C99A4B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="mt-7 max-w-[520px] text-[17px] leading-[1.8] text-stone-600">
            At Sidra Store, we bring you authentic Islamic lifestyle products
            that reflect tradition, quality and elegance. From attars to prayer
            essentials, everything you need for a more meaningful everyday life.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-8">
            {features.map(({ icon: Icon, a, b }, i) => (
              <Reveal key={a} delay={300 + i * 120} from="zoom">
                <div className="group flex h-full cursor-default flex-row items-center gap-3 rounded-2xl border border-gold/20 bg-white/70 p-3 sm:flex-col sm:items-start sm:gap-3.5 sm:border-0 sm:bg-transparent sm:p-0">
                  <span className="relative flex h-12 w-12 shrink-0 items-center sm:h-16 sm:w-16 justify-center rounded-full border border-gold/60 bg-white text-gold-dark shadow-sm transition duration-500 group-hover:-translate-y-1.5 group-hover:border-transparent group-hover:bg-gradient-to-b group-hover:from-gold-light group-hover:to-gold group-hover:text-ink group-hover:shadow-[0_12px_30px_-6px_rgba(201,154,75,0.8)]">
                    <span className="absolute inset-0 rounded-full border border-gold/40 opacity-0 transition duration-500 group-hover:scale-125 group-hover:opacity-100" />
                    <Icon size={26} strokeWidth={1.5} />
                  </span>
                  <p className="text-[13px] font-medium leading-tight text-stone-700 sm:text-sm">
                    {a}
                    <br />
                    {b}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-6 sm:mt-12">
            <a href="#" className="btn-gold group w-full !px-9 !py-4 !text-base sm:w-auto">
              Know Our Story
            </a>
            <span className="hidden items-center gap-2 text-sm text-stone-500 sm:flex">
              <span className="h-px w-10 bg-stone-300" />
              Since day one, rooted in faith
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
