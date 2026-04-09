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
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath(`/icons/purple/${name}.svg`)}
      alt={alt || name.replace(/-/g, " ")}
      width={size}
      height={size}
      className={className}
      style={variant === "white" ? { filter: "brightness(0) invert(1)" } : undefined}
    />
  );
}
