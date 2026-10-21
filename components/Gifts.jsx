import { Gift, Package, Tag } from "lucide-react";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import Particles from "./Particles";

const perks = [
  { icon: Gift, text: "Elegant Packaging" },
  { icon: Package, text: "Best for Gifting" },
  { icon: Tag, text: "Special Offers" },
];

export default function Gifts() {
  return (
    <section className="relative isolate overflow-hidden bg-[#07122c] text-white">
      <SmartImage
        src="/images/giftbg.png"
        tone="from-[#07122c] via-[#0b1d4a] to-[#14306e]"
        imgClassName="h-full w-full animate-kenburns object-cover object-[60%_62%]"
        className="absolute inset-0 -z-20"
      />
      {/* blue colour grade — shifts the hue without darkening the photo */}
      <div className="absolute inset-0 -z-10 bg-[#2a58d8]/25 mix-blend-color" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,12,34,0.95)_0%,rgba(5,12,34,0.85)_30%,rgba(5,12,34,0.35)_50%,transparent_62%,rgba(5,12,34,0.8)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[#07122c]/75 lg:hidden" />
      <Particles />

      <div className="container-site grid items-center gap-8 py-14 lg:h-[19vw] lg:max-h-[300px] lg:min-h-[250px] lg:grid-cols-[1fr_auto] lg:py-0">
        <Reveal from="left">
          <h2 className="font-serif text-4xl font-semibold lg:text-5xl">Gifts &amp; Combos</h2>
          <p className="mt-3 text-base text-stone-300">
            Perfect for yourself or your loved ones.
          </p>
          <a href="/gifts-combos" className="btn-gold mt-7 !px-7 !py-3.5 !text-sm">
            Shop Combos
          </a>
        </Reveal>

        <ul className="space-y-4 max-lg:rounded-2xl max-lg:border max-lg:border-gold/25 max-lg:bg-ink/80 max-lg:p-5 max-lg:shadow-xl">
          {perks.map(({ icon: Icon, text }, i) => (
            <Reveal key={text} from="right" delay={i * 130}>
              <li className="group flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 bg-ink/70 text-gold-light transition duration-300 group-hover:scale-110 group-hover:bg-gold group-hover:text-ink">
                  <Icon size={21} strokeWidth={1.5} />
                </span>
                <span className="text-base font-semibold text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.95)]">
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
