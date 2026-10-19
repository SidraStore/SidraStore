"use client";

import { useEffect, useRef, useState } from "react";

// Shows the image if the file exists in /public, otherwise falls back to the
// gradient placeholder (or a custom `fallback` node) so the layout never breaks.
export default function SmartImage({
  src,
  alt = "",
  className = "",
  imgClassName = "h-full w-full object-cover",
  tone = "from-stone-700 to-stone-900",
  fallback = null,
  children,
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef(null);

  // a missing file can fail before React attaches onError, so re-check on mount
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  // `relative` would override a caller's `absolute` (used for section backgrounds)
  const position = /\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative";

  return (
    <div className={`${position} overflow-hidden bg-gradient-to-br ${tone} ${className}`}>
      {!failed && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={imgClassName}
        />
      ) : (
        fallback
      )}
      {children}
    </div>
  );
}
