"use client";

interface CalloutBannerProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  variant?: "purple" | "green" | "amber";
}

const variants = {
  purple: {
    bg: "bg-boost-purple/5",
    accent: "bg-boost-purple",
    title: "text-boost-purple",
  },
  green: {
    bg: "bg-boost-green-light/5",
    accent: "bg-boost-green-light",
    title: "text-boost-green",
  },
  amber: {
    bg: "bg-boost-orange/5",
    accent: "bg-boost-orange",
    title: "text-boost-orange",
  },
};

export default function CalloutBanner({
  icon,
  title,
  description,
  variant = "purple",
}: CalloutBannerProps) {
  const v = variants[variant];

  return (
    <div className={`${v.bg} rounded-lg p-4 my-4 relative overflow-hidden`}>
      {/* Subtle top accent line instead of side-stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${v.accent}`} />
      <div className="flex items-start gap-3">
        {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
        <div>
          <p className={`font-semibold text-sm ${v.title}`}>{title}</p>
          <p className="text-xs text-boost-text-secondary mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}
