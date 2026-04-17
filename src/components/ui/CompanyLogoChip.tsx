"use client";

import { useState } from "react";
import { assetPath } from "@/lib/asset-path";

/**
 * Rounded white/dark chip that displays a company logo with a graceful
 * broken-image fallback. Used across the case studies section and the
 * admin Customer Dossier card.
 *
 * Sizes: sm = 24px, md = 40px, lg = 56px.
 * Tone "light" = white background with thin border (default).
 * Tone "dark" = translucent white with ring, for use over dark photos.
 */
export function CompanyLogoChip({
  src,
  alt,
  size = "sm",
  tone = "light",
}: {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
}) {
  const [hidden, setHidden] = useState(false);
  if (!src || hidden) return null;
  const sizeClass =
    size === "lg" ? "w-14 h-14" : size === "md" ? "w-10 h-10" : "w-6 h-6";
  const padClass =
    size === "lg" ? "p-2" : size === "md" ? "p-1.5" : "p-1";
  const bgClass =
    tone === "dark"
      ? "bg-white/92 ring-1 ring-white/20 shadow-md"
      : "bg-white ring-1 ring-boost-border/60 shadow-sm";
  return (
    <div
      className={`${sizeClass} ${bgClass} ${padClass} rounded-md flex items-center justify-center overflow-hidden`}
    >
      {/* Logo CDN images are simple static assets — bypass next/image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetPath(src)}
        alt={alt}
        onError={() => setHidden(true)}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}
