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
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath(`/icons/${variant}/${name}.svg`)}
      alt={alt || name.replace(/-/g, " ")}
      width={size}
      height={size}
      className={className}
    />
  );
}
