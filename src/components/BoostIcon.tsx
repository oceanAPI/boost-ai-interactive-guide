"use client";

import { assetPath } from "@/lib/asset-path";

interface BoostIconProps {
  name: string;
  variant?: "purple" | "white";
  size?: number;
  className?: string;
  alt?: string;
}

export default function BoostIcon({
  name,
  variant = "purple",
  size = 40,
  className = "",
  alt,
}: BoostIconProps) {
  // All SVG icon files use purple fill (#59195d).
  // Always load from /icons/purple/ and use CSS filter to invert to white.
  // If the icon file 404s (missing/typo'd name), hide the broken image cleanly
  // rather than rendering the alt text in a broken <img> placeholder.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath(`/icons/purple/${name}.svg`)}
      alt={alt || ""}
      width={size}
      height={size}
      className={className}
      style={variant === "white" ? { filter: "brightness(0) invert(1)" } : undefined}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        img.style.visibility = "hidden";
        // Also clear the alt text so nothing leaks through screen readers
        img.alt = "";
      }}
    />
  );
}
