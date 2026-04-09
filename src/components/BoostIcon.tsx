"use client";

import Image from "next/image";
import { iconPath } from "@/lib/icons";

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
    <Image
      src={iconPath(variant, name)}
      alt={alt || name.replace(/-/g, " ")}
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
}
