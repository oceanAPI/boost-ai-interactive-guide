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
    border: "border-l-boost-purple",
    title: "text-boost-purple",
  },
  green: {
    bg: "bg-boost-green-light/5",
    border: "border-l-boost-green-light",
    title: "text-boost-green",
  },
  amber: {
    bg: "bg-boost-orange/5",
    border: "border-l-boost-orange",
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
    <div className={`${v.bg} border-l-4 ${v.border} rounded-r-lg p-4 my-4`}>
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
