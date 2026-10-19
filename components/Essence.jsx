import { ArrowRight, Clock, Droplets, FlaskConical, Landmark } from "lucide-react";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import Particles from "./Particles";

const items = [
  { icon: Clock, text: "Long Lasting\nFragrance" },
  { icon: Droplets, text: "Alcohol Free" },
  { icon: FlaskConical, text: "Premium Ingredients" },
  { icon: Landmark, text: "Inspired by\nIslamic Heritage" },
];

export default function Essence() {
  return (
    <section className="relative isolate overflow-hidden bg-[#07122c] text-white">
      {/* mobile: photo sits on top so the bottle stays visible */}
      <SmartImage
        src="/images/Bestselling.png"
        alt="Sidra oudh attar"
        tone="from-ink via-[#2b1b0f] to-[#0f1a2b]"
        imgClassName="h-full w-full object-cover object-[66%_center]"
        className="h-[260px] w-full sm:h-[340px] lg:hidden"
      >
        <div className="absolute inset-0 bg-[#2a58d8]/25 mix-blend-color" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07122c] to-transparent" />
      </SmartImage>
      {/* desktop: photo is the section background */}
      <SmartImage
        src="/images/Bestselling.png"
        tone="from-ink via-[#2b1b0f] to-[#0f1a2b]"
        imgClassName="h-full w-full animate-kenburns object-cover object-[65%_center]"
        className="absolute inset-0 -z-20 hidden lg:block"
      />
      {/* blue colour grade — shifts the hue without darkening the photo */}
      <div className="absolute inset-0 -z-10 hidden bg-[#2a58d8]/25 mix-blend-color lg:block" />
      {/* pulsing cool glow behind the bottle */}
      <div className="absolute left-[66%] top-1/2 -z-10 hidden h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full bg-[radial-gradient(circle,rgba(255,176,90,0.3),rgba(96,140,255,0.2)_45%,transparent_68%)] mix-blend-screen lg:block" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#050c22]/80 via-transparent to-[#050c22]/80" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-[#050c22]/50 to-transparent" />
      <Particles />

      <div className="container-site grid items-center gap-8 pb-14 pt-4 lg:h-[33.3vw] lg:max-h-[560px] lg:min-h-[460px] lg:grid-cols-[1fr_auto] lg:py-0">
        <Reveal from="left">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">
            Bestselling
          </p>
          <h2 className="mt-4 font-serif text-5xl font-semibold leading-[1.1] lg:text-[64px]">
            <span className="text-shimmer">The Essence</span>
            <br />
            <span className="text-shimmer">of Pure Oudh</span>
          </h2>
          <p className="mt-6 max-w-[360px] text-lg leading-relaxed text-stone-200">
            Deep, rich and long lasting fragrances for true connoisseurs.
          </p>
          <a href="#" className="btn-gold mt-9">
            Explore Collection <ArrowRight size={18} />
          </a>
        </Reveal>

        {/* desktop: plain list pushed right, clear of the bottle; mobile: frosted panel */}
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:ml-auto lg:w-[250px] lg:grid-cols-1 max-lg:rounded-3xl max-lg:border max-lg:border-gold/25 max-lg:bg-ink/65 max-lg:p-5 max-lg:shadow-2xl">
          {items.map(({ icon: Icon, text }, i) => (
            <Reveal key={text} from="right" delay={i * 140}>
              <li className="group flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-ink/80 text-gold-light transition duration-300 group-hover:scale-110 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                  <Icon size={24} strokeWidth={1.5} />
                </span>
                <span className="whitespace-pre-line text-[15px] font-semibold leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.95)]">
                  {text}
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
