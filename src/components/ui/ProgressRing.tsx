"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
}

export default function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 6,
  color = "#36b595",
  label,
  showValue = true,
}: ProgressRingProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e2dce5"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: isVisible ? offset : circumference,
              transition: "stroke-dashoffset 1.2s ease-out",
            }}
          />
        </svg>
        {showValue && (
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-boost-dark">
            {percentage}%
          </span>
        )}
      </div>
      {label && <span className="text-xs text-boost-muted">{label}</span>}
    </div>
  );
}
