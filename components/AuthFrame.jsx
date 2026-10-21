import { Sparkles } from "lucide-react";
import Logo from "./Logo";

export default function AuthFrame({ eyebrow, title, description, children, footer }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-10 text-ink sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(232,189,109,0.14),transparent_38%,rgba(201,154,75,0.1))]" />
      <div className="pointer-events-none absolute -left-28 -top-28 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(232,189,109,0.32),transparent_67%)]" />
      <div className="pointer-events-none absolute -bottom-36 -right-28 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(201,154,75,0.2),transparent_68%)]" />
      <div className="pointer-events-none absolute left-[8%] top-[16%] hidden h-px w-32 bg-gradient-to-r from-transparent to-gold/60 lg:block" />
      <div className="pointer-events-none absolute bottom-[18%] right-[8%] hidden h-px w-32 bg-gradient-to-l from-transparent to-gold/60 lg:block" />

      <section className="relative w-full max-w-[500px] overflow-hidden rounded-[34px] border border-white/80 bg-white/95 px-6 py-8 shadow-[0_28px_80px_-32px_rgba(67,42,20,0.38)] backdrop-blur-sm sm:px-11 sm:py-10">
        <span className="absolute inset-x-12 top-0 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gold/[0.07]" />

        <div className="relative text-center">
          <div className="flex justify-center">
            <a href="/" aria-label="Go to Sidra Store home" className="inline-flex transition duration-300 hover:scale-105">
              <Logo className="h-14 sm:h-16" />
            </a>
          </div>

          <div className="mt-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/[0.08] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">
              <Sparkles size={13} /> {eyebrow}
            </span>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-[44px]">{title}</h1>
          <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-gold-dark to-gold-light" />
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-stone-500">{description}</p>
        </div>

        <div className="relative mt-7">{children}</div>
        {footer && <div className="relative mt-7 border-t border-stone-100 pt-6 text-center text-sm text-stone-500">{footer}</div>}
      </section>
    </main>
  );
}
