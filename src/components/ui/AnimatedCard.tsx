"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

interface AnimatedCardProps {
  children: React.ReactNode;
  variant?: "default" | "highlight" | "glass";
  delay?: number; // stagger index
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: "bg-white border border-boost-border",
  highlight: "bg-white border-2 border-boost-green-light/30",
  glass: "bg-white/60 backdrop-blur-sm border border-white/40",
};

export default function AnimatedCard({
  children,
  variant = "default",
  delay = 0,
  interactive = false,
  className = "",
  onClick,
}: AnimatedCardProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{ "--stagger-index": delay } as React.CSSProperties}
      className={`
        rounded-xl p-5 transition-all
        ${variantStyles[variant]}
        ${interactive ? "card-lift cursor-pointer pulse-glow" : ""}
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
