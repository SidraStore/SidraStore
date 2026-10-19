"use client";

import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import Particles from "./Particles";

export default function Newsletter() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0a1230] text-white">
      {/* dusk skyline strip (mosques at both ends, dark navy in the middle for the form) */}
      <SmartImage
        src="/images/stayupdated-strip.jpg"
        tone="from-[#1a1030] via-[#0a1230] to-[#7a3a3a]"
        imgClassName="h-full w-full animate-kenburns object-cover object-center"
        className="absolute inset-0 -z-20"
      />
      <Particles />

      <Reveal>
        <div className="container-site flex min-h-[190px] flex-col items-center justify-center gap-6 py-12 lg:min-h-[200px] lg:flex-row lg:gap-16 lg:py-10">
          <div className="text-center lg:text-left">
            <h2 className="font-serif text-3xl font-semibold lg:text-4xl">Stay Updated</h2>
            <p className="mt-2 text-[15px] text-stone-200">
              Subscribe to get exclusive offers, new arrivals
              <br className="hidden lg:block" /> and Islamic lifestyle tips.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-[520px] overflow-hidden rounded-xl bg-white shadow-2xl transition focus-within:ring-2 focus-within:ring-gold"
          >
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="min-w-0 flex-1 px-5 py-4 text-sm text-ink outline-none placeholder:text-stone-400"
            />
            <button
              type="submit"
              className="bg-gradient-to-b from-gold-light to-gold px-8 text-sm font-semibold text-ink transition hover:brightness-110"
            >
              Subscribe
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
