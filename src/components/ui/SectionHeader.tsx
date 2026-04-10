"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  number?: string;
  align?: "left" | "center";
}

export default function SectionHeader({
  title,
  subtitle,
  number,
  align = "left",
}: SectionHeaderProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });

  return (
    <div
      ref={ref}
      className={`mb-8 ${align === "center" ? "text-center" : ""} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"} transition-all duration-500`}
    >
      {number && (
        <span className="text-xs font-mono text-boost-green tracking-widest uppercase mb-2 block">
          {number}
        </span>
      )}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-boost-dark">{title}</h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-boost-muted mt-2 max-w-2xl leading-relaxed">
          {align === "center" ? <span className="mx-auto block">{subtitle}</span> : subtitle}
        </p>
      )}
    </div>
  );
}
