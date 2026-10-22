import { BadgeCheck, Gem, HeartHandshake, Landmark } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmartImage from "@/components/SmartImage";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Our Story | Sidra Store",
  description:
    "Discover the story, values, and Islamic heritage behind Sidra Store's authentic lifestyle collection.",
};

const values = [
  {
    icon: BadgeCheck,
    title: "Authentic Sourcing",
    text: "Every product is selected with care so tradition, quality, and trust remain at the heart of the collection.",
  },
  {
    icon: Gem,
    title: "Considered Quality",
    text: "From fragrance notes to fabric details, we look for lasting quality that feels special in everyday life.",
  },
  {
    icon: Landmark,
    title: "Rooted in Heritage",
    text: "Our collections celebrate Islamic craft, ritual, and beauty while fitting naturally into modern homes.",
  },
  {
    icon: HeartHandshake,
    title: "Personal Service",
    text: "We serve every customer with warmth, honesty, and the same attention we would offer our own family.",
  },
];

export default function OurStoryPage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden bg-cream text-ink">
        <section className="relative isolate min-h-[620px] overflow-hidden bg-ink text-white">
          <SmartImage
            src="/images/lifestyle.png"
            alt="A serene mosque courtyard reflecting Sidra Store's heritage"
            tone="from-amber-900 via-stone-800 to-ink"
            className="absolute inset-0 -z-20"
            imgClassName="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/45 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink/80 to-transparent" />

          <div className="container-site flex min-h-[620px] items-center py-20">
            <Reveal from="left" className="max-w-[680px]">
              <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold-light">
                <span className="h-px w-12 bg-gold" />
                Our Story
              </p>
              <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.08] sm:text-6xl lg:text-7xl">
                Tradition Made Meaningful
                <span className="mt-2 block text-shimmer">For Everyday Life</span>
              </h1>
              <p className="mt-7 max-w-[600px] text-base leading-8 text-stone-200 sm:text-lg">
                Sidra Store began with a simple belief: products connected to faith and heritage should feel authentic,
                beautiful, and easy to bring into daily life.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="container-site grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <Reveal from="left">
            <SmartImage
              src="/images/sidraouthcollection.png"
              alt="Sidra Store's premium Oudh collection"
              tone="from-amber-950 via-stone-800 to-ink"
              className="aspect-[4/3] overflow-hidden rounded-[32px] shadow-[0_30px_70px_-30px_rgba(21,16,12,0.65)]"
              imgClassName="h-full w-full object-cover object-center"
            />
          </Reveal>

          <Reveal from="right">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-dark">Where It Began</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              A love for fragrance,
              <span className="block text-shimmer-dark">guided by faith</span>
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-stone-600">
              <p>
                Our journey started with attars: rich, alcohol-free fragrances that carry memory, character, and a
                timeless sense of occasion. We wanted to make that experience approachable without losing its soul.
              </p>
              <p>
                From there, Sidra Store grew into a thoughtful collection of Islamic caps, prayer essentials, surma,
                traditional wear, and gifts chosen to enrich meaningful moments.
              </p>
            </div>
            <a href="/shop?category=attar-and-fragrances" className="btn-gold mt-8 !px-7 !py-3.5">
              Explore Our Attars
            </a>
          </Reveal>
        </section>

        <section className="relative bg-white py-20 lg:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,189,109,0.2),transparent_38%)]" />
          <div className="container-site relative">
            <Reveal className="mx-auto max-w-[700px] text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-dark">What Guides Us</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Values behind every collection</h2>
              <p className="mt-4 text-base leading-7 text-stone-500">
                The choices we make begin with respect for our customers, our heritage, and the purpose each product
                serves.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(({ icon: Icon, title, text }, index) => (
                <Reveal key={title} delay={index * 90} from="zoom">
                  <article className="h-full rounded-3xl border border-gold/20 bg-cream p-6 shadow-[0_18px_45px_-30px_rgba(21,16,12,0.5)]">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold text-ink">
                      <Icon size={24} strokeWidth={1.5} />
                    </span>
                    <h3 className="mt-5 font-serif text-2xl font-semibold">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="container-site grid items-center gap-10 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-28">
          <Reveal from="left">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-dark">Made for Sharing</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Thoughtful pieces for
              <span className="block text-shimmer-dark">meaningful moments</span>
            </h2>
            <p className="mt-6 text-base leading-8 text-stone-600">
              Whether you are choosing a personal fragrance, preparing for prayer, or gifting someone you love, we
              want every Sidra Store experience to feel warm, dependable, and memorable.
            </p>
            <a href="/all-products" className="btn-gold mt-8 !px-7 !py-3.5">
              Browse All Products
            </a>
          </Reveal>

          <Reveal from="right">
            <SmartImage
              src="/images/giftbg.png"
              alt="A thoughtfully presented Sidra Store gift collection"
              tone="from-blue-950 via-indigo-900 to-ink"
              className="aspect-[16/10] overflow-hidden rounded-[32px] shadow-[0_30px_70px_-30px_rgba(21,16,12,0.65)]"
              imgClassName="h-full w-full object-cover object-center"
            />
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
