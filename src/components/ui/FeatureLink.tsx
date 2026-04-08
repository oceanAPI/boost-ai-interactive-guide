"use client";

import Badge from "./Badge";

interface FeatureLinkProps {
  title: string;
  description: string;
  url: string;
  category?: string;
  icon?: React.ReactNode;
}

export default function FeatureLink({
  title,
  description,
  url,
  category,
  icon,
}: FeatureLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-boost-border bg-white p-4 card-lift hover:border-boost-green-light/40 transition-all"
    >
      <div className="flex items-start gap-3">
        {icon && <span className="flex-shrink-0 text-boost-green mt-0.5">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-boost-dark group-hover:text-boost-green transition-colors">
              {title}
            </span>
            {category && <Badge variant="muted">{category}</Badge>}
          </div>
          <p className="text-xs text-boost-muted line-clamp-2">{description}</p>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className="text-boost-muted group-hover:text-boost-green flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5"
        >
          <path d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </div>
    </a>
  );
}
