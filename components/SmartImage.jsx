"use client";

import { useEffect, useRef, useState } from "react";

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
  const [loading, setLoading] = useState(true);
  const imgRef = useRef(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    
    const handleLoad = () => setLoading(false);
    const handleError = () => {
      setFailed(true);
      setLoading(false);
    };

    el.addEventListener("load", handleLoad);
    el.addEventListener("error", handleError);

    if (el.complete) {
      if (el.naturalWidth === 0) {
        handleError();
      } else {
        handleLoad();
      }
    }

    return () => {
      el.removeEventListener("load", handleLoad);
      el.removeEventListener("error", handleError);
    };
  }, [src]);

  const position = /\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative";

  return (
    <div className={`${position} overflow-hidden bg-gradient-to-br ${tone} ${className}`}>
      {src && !failed ? (
        <>
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`${imgClassName} ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
            onLoad={() => setLoading(false)}
            onError={() => setFailed(true)}
          />
          {loading && <div className="absolute inset-0 bg-gradient-to-br ${tone} animate-pulse" />}
        </>
      ) : (
        fallback
      )}
      {children}
    </div>
  );
}
