// logo.png is dark navy on transparent; `light` turns it white for dark backgrounds.
export default function Logo({ className = "h-12", light = false }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo.png"
      alt="Sidra"
      className={`w-auto select-none ${light ? "brightness-0 invert" : ""} ${className}`}
    />
  );
}
