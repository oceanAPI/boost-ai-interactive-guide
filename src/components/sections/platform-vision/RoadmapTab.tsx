"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  PRODUCT_ROADMAP_2026,
  BUCKETS,
  FOCUS_AREAS,
  type RoadmapItem,
  type RoadmapBucket,
} from "@/data/product-roadmap-2026";
import { hasRoadmapImage } from "@/data/roadmap-images";
import { assetPath } from "@/lib/asset-path";

const BUCKET_ORDER: RoadmapBucket[] = ["now", "soon", "later"];

/* ─── Bucket segment tab ─── */
function BucketTab({
  bucket,
  active,
  count,
  onClick,
}: {
  bucket: RoadmapBucket;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  const meta = BUCKETS[bucket];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative group flex-1 flex flex-col items-start text-left px-5 py-4 rounded-t-xl transition-all duration-300 ${
        active
          ? "bg-white shadow-sm z-10"
          : "bg-boost-surface/60 hover:bg-boost-surface"
      }`}
    >
      <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
        active ? "text-boost-green-light" : "text-boost-muted/70"
      }`}>
        {meta.sublabel}
      </span>
      <span className={`mt-1 text-base sm:text-lg font-bold leading-tight transition-colors ${
        active ? "text-boost-dark" : "text-boost-muted"
      }`}>
        {meta.label}
        <span className={`ml-2 text-[11px] font-semibold tabular-nums ${
          active ? "text-boost-muted" : "text-boost-muted/60"
        }`}>
          {count}
        </span>
      </span>

      {/* Active indicator bar */}
      <div
        className={`absolute bottom-0 left-5 right-5 h-0.5 rounded-full transition-all duration-300 ${
          active ? "bg-boost-green-light" : "bg-transparent"
        }`}
      />
    </button>
  );
}

/* ─── One roadmap item row — collapsed + expands in place ─── */
function ItemRow({
  item,
  isActive,
  onClick,
}: {
  item: RoadmapItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const focus = FOCUS_AREAS[item.focus];
  const imgSrc = hasRoadmapImage(item.id)
    ? assetPath(`/photos/roadmap-2026/${item.id}.jpg`)
    : null;

  return (
    <div className={`border-b border-boost-border/40 last:border-b-0 transition-colors ${isActive ? "bg-boost-surface/30" : ""}`}>
      {/* Clickable row */}
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left px-5 sm:px-7 py-5 flex items-start gap-5 group"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted/80">
              {focus.shortLabel}
            </span>
            <span className="text-boost-border">·</span>
            <span className="text-[10px] font-medium text-boost-muted/80 tabular-nums">
              {item.quarter}
            </span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-boost-dark leading-snug">
            {item.title}
          </p>
          <p className="text-[13px] text-boost-text-secondary leading-relaxed mt-1">
            {item.summary}
          </p>
        </div>

        {/* Quiet chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`mt-1 flex-shrink-0 text-boost-muted/40 group-hover:text-boost-dark transition-all duration-300 ${
            isActive ? "rotate-180 text-boost-green-light" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded detail — in place, not a modal */}
      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: isActive ? "1200px" : "0",
          opacity: isActive ? 1 : 0,
        }}
      >
        <div className="px-5 sm:px-7 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 pt-2">
            {/* Left — text */}
            <div className={imgSrc ? "md:col-span-3" : "md:col-span-5"}>
              <p className="text-[10px] font-bold text-boost-muted uppercase tracking-widest mb-2.5">
                What it does
              </p>
              <div className="space-y-3">
                {item.description.split("\n\n").map((para, i) => (
                  <p key={i} className="text-sm text-boost-text-secondary leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Unlocks — the business-value kicker */}
              <div className="mt-5 pt-5 border-t border-boost-border/50">
                <p className="text-[10px] font-bold text-boost-green uppercase tracking-widest mb-2">
                  What this unlocks for you
                </p>
                <p className="text-sm text-boost-dark leading-relaxed">{item.unlocks}</p>
              </div>
            </div>

            {/* Right — optional slide image */}
            {imgSrc && (
              <div className="md:col-span-2">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-boost-surface border border-boost-border/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <Image
                    src={imgSrc}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 360px"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function RoadmapTab({ visible }: { visible: boolean }) {
  const [activeBucket, setActiveBucket] = useState<RoadmapBucket>("now");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const byBucket = useMemo(() => {
    return {
      now: PRODUCT_ROADMAP_2026.filter((i) => i.bucket === "now"),
      soon: PRODUCT_ROADMAP_2026.filter((i) => i.bucket === "soon"),
      later: PRODUCT_ROADMAP_2026.filter((i) => i.bucket === "later"),
    };
  }, []);

  const visibleItems = byBucket[activeBucket];

  const handleBucketChange = (b: RoadmapBucket) => {
    setActiveBucket(b);
    setExpandedId(null);
  };

  const handleItemToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      {/* Segment tabs — mirrors the Today tab pattern */}
      <div className="grid grid-cols-3 gap-2">
        {BUCKET_ORDER.map((b) => (
          <BucketTab
            key={b}
            bucket={b}
            active={activeBucket === b}
            count={byBucket[b].length}
            onClick={() => handleBucketChange(b)}
          />
        ))}
      </div>

      {/* Panel — connected to tabs, one calm list */}
      <div
        className="relative bg-white rounded-b-2xl border border-boost-border/50 border-t-0 shadow-sm overflow-hidden transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {visibleItems.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-boost-muted">
            Nothing in this bucket yet.
          </div>
        ) : (
          <div>
            {visibleItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                isActive={expandedId === item.id}
                onClick={() => handleItemToggle(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
