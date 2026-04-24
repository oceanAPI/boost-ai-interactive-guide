"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  color?: "green" | "purple" | "white";
  size?: "sm" | "md" | "lg";
  /** Decimal places when animating. Defaults to 0 (integer). Pass 1
   *  for values that can legitimately be fractional (e.g. break-even
   *  months under 1). */
  decimals?: number;
}

const colorMap = {
  green: "text-boost-green",
  purple: "text-boost-purple",
  white: "text-white",
};

const sizeMap = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
};

const labelColorMap = {
  green: "text-boost-muted",
  purple: "text-boost-muted",
  white: "text-white/60",
};

export default function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  color = "green",
  size = "md",
  decimals = 0,
}: StatCounterProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const count = useCountUp({ target: value, enabled: isVisible, duration: 1200, decimals });

  return (
    <div ref={ref} className="text-center">
      <span className={`${colorMap[color]} ${sizeMap[size]} font-bold tabular-nums`}>
        {prefix}{count}{suffix}
      </span>
      <p className={`text-xs mt-1 ${labelColorMap[color]}`}>{label}</p>
    </div>
  );
}
