"use client";

import { useEffect, useMemo, useState } from "react";
import SmartImage from "./SmartImage";

export default function ProductGallery({ product }) {
  const images = useMemo(
    () => [...new Set([product.src, ...(product.galleryUrls || [])].filter(Boolean))],
    [product.galleryUrls, product.src],
  );
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const [zoomed, setZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setSelectedImage(images[0] || "");
    setZoomed(false);
  }, [images]);

  function updateZoomPosition(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setZoomPosition({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[76px_minmax(0,1fr)]">
      <div className="order-2 flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:max-h-[640px] sm:flex-col sm:overflow-y-auto sm:pr-1">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => { setSelectedImage(image); setZoomed(false); }}
            aria-label={`View product image ${index + 1}`}
            aria-pressed={selectedImage === image}
            className={`h-[70px] w-[70px] shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${selectedImage === image ? "border-gold shadow-md" : "border-transparent hover:border-gold/50"}`}
          >
            <SmartImage src={image} alt="" tone={product.tone} className="h-full w-full" imgClassName="h-full w-full object-contain" />
          </button>
        ))}
      </div>

      <div
        className={`order-1 relative overflow-hidden rounded-[24px] sm:order-2 ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={updateZoomPosition}
        onClick={() => setZoomed((value) => !value)}
      >
        <SmartImage
          src={selectedImage}
          alt={product.name}
          tone={product.tone}
          className="aspect-square w-full"
          style={{ "--zoom-x": `${zoomPosition.x}%`, "--zoom-y": `${zoomPosition.y}%` }}
          imgClassName={`h-full w-full object-contain transition-transform duration-300 [transform-origin:var(--zoom-x)_var(--zoom-y)] ${zoomed ? "scale-[1.8]" : "scale-100"}`}
          loading="eager"
          fetchPriority="high"
        />
        <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-ink/75 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
          Move cursor to zoom
        </span>
      </div>
    </div>
  );
}
