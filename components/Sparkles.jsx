// Twinkling 4-point stars. Fixed positions so server/client markup matches.
const stars = [
  { l: "64%", t: "52%", s: 22, d: 0 },
  { l: "70%", t: "66%", s: 16, d: 1.2 },
  { l: "77%", t: "58%", s: 26, d: 2.1 },
  { l: "84%", t: "70%", s: 14, d: 0.6 },
  { l: "58%", t: "72%", s: 14, d: 1.8 },
  { l: "90%", t: "44%", s: 18, d: 2.7 },
  { l: "73%", t: "30%", s: 12, d: 3.2 },
];

export default function Sparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      {stars.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute animate-twinkle text-gold-light drop-shadow-[0_0_8px_rgba(255,226,160,0.95)]"
          style={{ left: p.l, top: p.t, width: p.s, height: p.s, animationDelay: `${p.d}s` }}
        >
          <path
            fill="currentColor"
            d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z"
          />
        </svg>
      ))}
    </div>
  );
}
