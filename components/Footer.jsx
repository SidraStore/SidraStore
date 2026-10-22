import { Heart, Mail, MapPin, Phone, Truck, BadgeCheck, CreditCard } from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";
import Logo from "./Logo";
import Reveal from "./Reveal";
import { footerCategories, quickLinks } from "@/lib/data";

const socials = [
  { icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/sidrastore.in?igsh=MTNlMThvcWRhYnB5Yw==" },
  { icon: FaFacebookF, label: "Facebook", href: "https://www.facebook.com/profile.php?id=61587703357197" },
  { icon: FaYoutube, label: "YouTube", href: "#" },
  { icon: FaWhatsapp, label: "WhatsApp", href: "#" },
];

const bottomPerks = [
  { icon: CreditCard, text: "Secure Payments" },
  { icon: Truck, text: "Fast Delivery" },
  { icon: BadgeCheck, text: "100% Authentic Products" },
];

function Col({ title, items }) {
  const routes = {
    Home: "/",
    Shop: "/shop",
    "About Us": "/about",
    Contact: "/contact",
    "All Products": "/shop",
    "Attar & Fragrances": "/shop?category=attar-and-fragrances",
    "Islamic Caps": "/shop?category=islamic-caps",
    Surma: "/shop?category=surma",
    "Prayer Essentials": "/shop?category=prayer-essentials",
    "Islamic Wear": "/shop?category=islamic-wear",
    "Gifts & Combos": "/shop?category=gifts-and-combos",
  };
  return (
    <div>
      <h4 className="text-base font-bold text-gold-light">{title}</h4>
      <ul className="mt-5 space-y-3">
        {items.map((i) => (
          <li key={i}>
            <a
              href={routes[i] || "#"}
              className="inline-block text-sm text-stone-300 transition duration-300 hover:translate-x-1.5 hover:text-gold-light"
            >
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <Reveal>
        <div className="container-site grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr_1.4fr_1.5fr] lg:gap-12 lg:py-16">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Logo light className="h-16" />
            <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-stone-300">
              Premium Attar &amp; Islamic Lifestyle Products for a More Meaningful Everyday.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/60 text-gold transition duration-300 hover:-translate-y-1 hover:bg-gold hover:text-ink"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <Col title="Quick Links" items={quickLinks} />
          <Col title="Categories" items={footerCategories} />

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-base font-bold text-gold-light">Contact Us</h4>
            <ul className="mt-5 space-y-4 text-sm text-stone-300">
              <li className="flex gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-gold" />
                Near M.S. Hospital, Hussainiya School, 4 Khamba, Jabalpur, Madhya Pradesh 482003
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-gold" />
                7489407728
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-gold" />
                sidrastoreamo@gmail.com
              </li>
            </ul>
          </div>

          {/* mosque arch + tagline, standing on the footer's bottom line */}
          <div className="relative col-span-2 -mb-14 flex items-end justify-center gap-5 self-end md:col-span-3 lg:col-span-1 lg:-mb-16 lg:justify-start">
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-[260px] w-[260px] -translate-x-1/2 animate-glow rounded-full bg-[radial-gradient(circle,rgba(232,189,109,0.35),transparent_65%)] lg:-left-10 lg:h-[300px] lg:translate-x-0" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/footer.png"
              alt="Mosque"
              className="relative h-[250px] w-auto shrink-0 select-none drop-shadow-[0_0_30px_rgba(232,189,109,0.35)] lg:h-[320px]"
            />
            <div className="relative mb-16 font-serif text-xl leading-snug text-gold-light lg:mb-24 lg:text-[22px]">
              <p>Faith</p>
              <p>Fragrance</p>
              <p>Lifestyle</p>
              <span className="mt-3 block h-px w-14 bg-gradient-to-r from-gold to-transparent" />
            </div>
          </div>
        </div>
      </Reveal>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-4 py-6 text-sm text-stone-400 md:flex-row">
          <p>© 2026 Sidra Store. All rights reserved.</p>
          <ul className="flex flex-wrap items-center justify-center gap-8">
            {bottomPerks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon size={16} className="text-gold" /> {text}
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-1.5">
            Made with <Heart size={14} className="animate-pulse text-red-500" fill="currentColor" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
