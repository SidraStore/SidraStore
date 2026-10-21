"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronDown,
  Heart,
  Mail,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react";
import Logo from "./Logo";
import MobileSidebar from "./MobileSidebar";
import { useCart } from "./CartProvider";
import { useStorefrontContent } from "./useStorefrontData";

// rotating announcement in the top bar
const defaultAnnouncements = [
  { icon: Truck, text: "Free Shipping on orders above ₹999" },
  { icon: BadgeCheck, text: "100% Authentic Attar & Islamic Products" },
  { icon: Sparkles, text: "Alcohol Free • Long Lasting Fragrances" },
];

function Ticker({ announcements }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % announcements.length), 3500);
    return () => clearInterval(id);
  }, []);
  const { icon: Icon, text } = announcements[i];
  return (
    <span
      key={i}
      className="hidden animate-fade-in items-center gap-2.5 whitespace-nowrap font-medium sm:flex"
    >
      <Icon size={15} className="text-gold" />
      <span className="text-shimmer">{text}</span>
    </span>
  );
}

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Gifts & Combos", badge: "New", href: "/gifts-combos" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const { itemCount } = useCart();
  const { data: storefrontContent } = useStorefrontContent();
  const announcementMessages = storefrontContent.announcements.length ? storefrontContent.announcements.map((item) => item.message) : defaultAnnouncements.map((item) => item.text);
  const announcements = announcementMessages.map((text, index) => ({ icon: defaultAnnouncements[index % defaultAnnouncements.length].icon, text }));
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 40);
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-50 animate-fade-in">
      {/* top bar — folds away once you scroll */}
      <div
        className={`overflow-hidden bg-gradient-to-r from-ink via-[#241a12] to-ink text-[12.5px] text-stone-300 transition-all duration-500 ${
          scrolled ? "max-h-0 border-b-0 opacity-0" : "max-h-10 border-b border-gold/20 opacity-100"
        }`}
      >
        {/* mobile: auto-scrolling marquee so nothing gets cut off */}
        <div className="relative flex h-10 items-center overflow-hidden md:hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-ink to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-ink to-transparent" />
          <div className="flex w-max animate-marquee items-center whitespace-nowrap">
            {[0, 1].map((n) => (
              <div key={n} className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={n === 1}>
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-gold" />
                  Near M.S. Hospital, Hussainiya School, 4 Khamba, Jabalpur, MP 482003
                </span>
                {announcementMessages.map((message) => <span key={message} className="flex items-center gap-2 font-medium"><Truck size={14} className="text-gold" /><span className="text-shimmer">{message}</span></span>)}
                <a href="tel:7489407728" className="flex items-center gap-2">
                  <Phone size={14} className="text-gold" />
                  7489407728
                </a>
                <a href="mailto:sidrastoreamo@gmail.com" className="flex items-center gap-2">
                  <Mail size={14} className="text-gold" />
                  sidrastoreamo@gmail.com
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* tablet / desktop */}
        <div className="container-site hidden h-10 items-center justify-between md:flex">
          <div className="flex items-center gap-6 overflow-hidden whitespace-nowrap">
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-gold" />
              Near M.S. Hospital, Hussainiya School, 4 Khamba, Jabalpur, MP 482003
            </span>
            <a href="tel:7489407728" className="hidden items-center gap-2 transition hover:text-gold-light md:flex">
              <Phone size={14} className="text-gold" />
              7489407728
            </a>
            <a
              href="mailto:sidrastoreamo@gmail.com"
              className="hidden items-center gap-2 transition hover:text-gold-light lg:flex"
            >
              <Mail size={14} className="text-gold" />
              sidrastoreamo@gmail.com
            </a>
          </div>
          <Ticker announcements={announcements} />
        </div>
      </div>

      {/* main nav */}
      <div
        className={`relative border-b transition-all duration-500 ${
          scrolled
            ? "border-gold/30 bg-white shadow-[0_10px_40px_-12px_rgba(21,16,12,0.35)]"
            : "border-stone-200 bg-white"
        }`}
      >
        <div
          className={`container-site flex items-center justify-between gap-2 transition-all duration-500 sm:gap-6 ${
            scrolled ? "h-[66px]" : "h-[84px]"
          }`}
        >
          <a
            href="/"
            aria-label="Sidra home"
            className={`shrink-0 transition duration-300 hover:scale-105 ${searchOpen ? "hidden md:block" : ""}`}
          >
            <Logo className={`transition-all duration-500 ${scrolled ? "h-7 sm:h-8" : "h-9 sm:h-11"}`} />
          </a>

          {/* desktop links */}
          <nav className="hidden items-center gap-4 xl:flex 2xl:gap-6">
            {navItems.map((item) => (
              <div key={item.label} className="group relative">
                {item.children ? (
                  // Parent with dropdown - use button, not anchor
                  <>
                    <button
                      className="relative flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[14px] font-semibold text-ink transition duration-300 hover:bg-gold/10 hover:text-gold-dark"
                    >
                      {item.label}
                      {item.badge && (
                        <span className="rounded-full bg-gradient-to-b from-gold-light to-gold px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-ink shadow-[0_0_12px_rgba(232,189,109,0.8)]">
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown
                        size={14}
                        className="transition duration-300 group-hover:rotate-180"
                      />
                      {/* underline grows from the centre */}
                      <span className="absolute bottom-0.5 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold-dark transition-all duration-300 group-hover:w-[55%]" />
                    </button>
                    <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 translate-y-3 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-white p-2 shadow-[0_24px_60px_-12px_rgba(21,16,12,0.45)]">
                        <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-gold-dark via-gold-light to-gold-dark" />
                        <p className="px-4 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-dark">
                          {item.label}
                        </p>
                        {item.children.map((c, i) => (
                          <a
                            key={c.name}
                            href={c.href}
                            style={{ transitionDelay: `${i * 30}ms` }}
                            className="group/item flex items-center rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-cream hover:pl-5 hover:text-gold-dark"
                          >
                            {c.name}
                          </a>
                        ))}
                        <a
                          href={item.href}
                          className="group/all mt-1 flex items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gold hover:text-ink"
                        >
                          View all
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  // Simple link without dropdown
                  <a
                    href={item.href || "#"}
                    className="relative flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[14px] font-semibold text-ink transition duration-300 hover:bg-gold/10 hover:text-gold-dark"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="rounded-full bg-gradient-to-b from-gold-light to-gold px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-ink shadow-[0_0_12px_rgba(232,189,109,0.8)]">
                        {item.badge}
                      </span>
                    )}
                    {/* underline grows from the centre */}
                    <span className="absolute bottom-0.5 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold-dark transition-all duration-300 group-hover:w-[55%]" />
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* actions */}
          <div className="flex shrink-0 items-center gap-0.5 text-ink sm:gap-1.5">
            {/* expanding search */}
            <div
              className={`flex items-center overflow-hidden rounded-full border transition-all duration-500 ${
                searchOpen
                  ? "w-[210px] border-gold/50 bg-cream pl-4 sm:w-[260px]"
                  : "w-10 border-transparent sm:w-11"
              }`}
            >
              <input
                ref={searchRef}
                type="search"
                placeholder="Search attars, caps..."
                tabIndex={searchOpen ? 0 : -1}
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
              />
              <button
                aria-label="Search"
                onClick={() => setSearchOpen((v) => !v)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-gold/15 hover:text-gold-dark sm:h-11 sm:w-11"
              >
                {searchOpen ? <X size={20} /> : <Search size={21} />}
              </button>
            </div>

            <a
              href="/login"
              aria-label="Account"
              className="hidden h-11 w-11 items-center justify-center rounded-full transition hover:bg-gold/15 hover:text-gold-dark sm:flex"
            >
              <User size={21} />
            </a>

            <button
              aria-label="Wishlist"
              className="hidden h-11 w-11 items-center justify-center rounded-full transition hover:bg-gold/15 hover:text-red-500 2xl:flex"
            >
              <Heart size={21} />
            </button>

            {/* cart pill */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="group relative flex h-10 items-center gap-1.5 overflow-hidden rounded-full bg-ink py-1 pl-3 pr-1 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(21,16,12,0.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-gradient-to-b hover:from-gold-light hover:to-gold hover:text-ink sm:ml-2 sm:h-11 sm:gap-2.5 sm:pl-4 sm:pr-1.5"
            >
              <ShoppingBag size={18} className="text-gold-light transition group-hover:text-ink" />
              <span className="hidden sm:inline">Cart</span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold text-xs font-bold text-ink ring-1 ring-gold-light/60 transition group-hover:bg-none group-hover:bg-ink group-hover:text-gold-light group-hover:ring-ink sm:h-8 sm:w-8">
                {itemCount}
              </span>
            </Link>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="relative -mr-2 ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-cream text-ink shadow-sm transition duration-300 hover:border-gold hover:bg-gold/15 sm:ml-0 sm:mr-0 sm:h-11 sm:w-11 xl:hidden"
              onClick={() => setOpen((value) => !value)}
            >
              <span
                className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${
                  open ? "rotate-45" : "-translate-y-1.5"
                }`}
              />
              <span
                className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${
                  open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
                }`}
              />
              <span
                className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${
                  open ? "-rotate-45" : "translate-y-1.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* gold hairline along the bottom edge */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

        {/* scroll-progress line */}
        <span
          className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-gold-dark via-gold-light to-gold transition-opacity duration-300 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <MobileSidebar open={open} onClose={closeMenu} items={navItems} />
    </header>
  );
}
