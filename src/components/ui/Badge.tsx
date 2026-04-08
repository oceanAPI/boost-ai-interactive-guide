"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "purple" | "orange" | "outline" | "muted";
  size?: "sm" | "md";
}

const variants = {
  green: "bg-boost-green-light/15 text-boost-green border-boost-green-light/30",
  purple: "bg-boost-purple/10 text-boost-purple border-boost-purple/20",
  orange: "bg-boost-orange/10 text-boost-orange border-boost-orange/30",
  outline: "bg-transparent text-boost-muted border-boost-border",
  muted: "bg-boost-surface text-boost-muted border-boost-border",
};

const sizes = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
};

export default function Badge({ children, variant = "green", size = "sm" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
