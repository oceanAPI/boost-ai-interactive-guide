"use client";

interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export default function Tooltip({ content, position = "top", children }: TooltipProps) {
  return (
    <span className="relative group inline-flex">
      {children}
      <span
        className={`
          absolute ${positionClasses[position]} z-50
          px-2.5 py-1.5 text-xs text-white bg-boost-dark rounded-lg shadow-lg
          whitespace-nowrap pointer-events-none
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
        `}
      >
        {content}
      </span>
    </span>
  );
}
