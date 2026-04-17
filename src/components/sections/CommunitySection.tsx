"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import VideoModal, { getVideoThumb } from "@/components/VideoModal";
import { COMMUNITY_VIDEOS, type CommunityVideo } from "@/data/community-videos";

/**
 * Categories render as collapsible groups rather than a flat filter. Much
 * easier to scan, and a long-press of placeholder cards feels less monotone
 * when broken into 2-3 smaller chunks.
 */
const CATEGORIES = [
  {
    key: "Getting Started",
    eyebrow: "Start here",
    title: "Getting Started",
    description: "The essentials — platform overview and your first specialist agent",
    /** Subtle accent tint for placeholder cards in this category */
    accent: "from-boost-purple/30 to-boost-purple-dark/40",
  },
  {
    key: "Platform",
    eyebrow: "Platform depth",
    title: "Platform",
    description: "Orchestrator, guardrails, analytics — how the pieces fit together",
    accent: "from-boost-green/25 to-boost-purple-dark/45",
  },
  {
    key: "Best Practices",
    eyebrow: "Best practices",
    title: "Best Practices",
    description: "Patterns that separate great deployments from just-working ones",
    accent: "from-boost-gold/20 to-boost-purple-dark/50",
  },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

function VideoCard({
  video,
  index,
  visible,
  onPlay,
  categoryAccent,
}: {
  video: CommunityVideo;
  index: number;
  visible: boolean;
  onPlay: () => void;
  /** Tailwind gradient classes e.g. "from-boost-purple/30 to-boost-purple-dark/40" */
  categoryAccent: string;
}) {
  const thumb = getVideoThumb(video.url);
  const hasVideo = !!video.url;

  return (
    <button
      type="button"
      onClick={hasVideo ? onPlay : undefined}
      disabled={!hasVideo}
      className={`group text-left w-full rounded-xl border border-boost-border bg-white overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-purple/40 ${
        hasVideo
          ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
          : "cursor-default"
      }`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transitionProperty: "opacity, transform, box-shadow",
        transitionDuration: "400ms",
        transitionDelay: `${60 + index * 60}ms`,
      }}
    >
      {/* Thumbnail / branded placeholder */}
      <div className="relative aspect-video overflow-hidden">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          // Branded placeholder — tinted per category to reduce monotony
          <div
            className={`w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${categoryAccent}`}
          >
            {/* Soft dots pattern */}
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            {/* Lock/coming-soon icon */}
            <div className="flex flex-col items-center gap-1.5 relative z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <span className="text-[9px] uppercase tracking-[0.18em] font-semibold text-white/55">
                Coming soon
              </span>
            </div>
          </div>
        )}

        {hasVideo && (
          <>
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                <svg className="w-6 h-6 text-boost-dark ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </>
        )}

        {/* Duration badge */}
        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-[11px] font-medium text-white tabular-nums backdrop-blur-sm">
          {video.duration}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className={`text-sm font-semibold text-boost-dark leading-snug transition-colors duration-200 ${hasVideo ? "group-hover:text-boost-purple" : ""}`}>
          {video.title}
        </h3>
        <p className="text-xs text-boost-muted mt-1.5 leading-relaxed line-clamp-1">
          {video.description}
        </p>
      </div>
    </button>
  );
}

/* ─── Collapsible category group ─── */
function CategoryGroup({
  category,
  videos,
  defaultOpen,
  visible,
  onPlay,
}: {
  category: (typeof CATEGORIES)[number];
  videos: CommunityVideo[];
  defaultOpen: boolean;
  visible: boolean;
  onPlay: (url: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-boost-border/60 bg-white overflow-hidden">
      {/* Header — clickable to toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-boost-surface/40 transition-colors"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-green">
            {category.eyebrow}
          </p>
          <p className="text-base font-bold text-boost-dark leading-tight mt-0.5">
            {category.title}
          </p>
          <p className="text-xs text-boost-muted leading-relaxed mt-1">
            {category.description}
          </p>
        </div>
        <span className="flex items-center gap-2 shrink-0 text-boost-muted">
          <span className="text-[11px] tabular-nums">
            {videos.length}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Video grid — collapses via grid-rows animation */}
      <div
        className="grid transition-all duration-300"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pt-0 pb-5 border-t border-boost-border/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-5">
              {videos.map((video, i) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  index={i}
                  visible={visible && open}
                  onPlay={() => onPlay(video.url)}
                  categoryAccent={category.accent}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommunitySection({ sectionNumber }: { sectionNumber?: string }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  return (
    <section ref={ref}>
      <SectionHeader
        number={sectionNumber ?? "07"}
        title="Boost.ai Community"
        subtitle="On-demand enablement — training videos, platform walkthroughs, and best-practice content to help your team master the boost.ai platform"
      />

      {/* Collapsible category groups — first opens by default */}
      <div className="space-y-3">
        {CATEGORIES.map((category, i) => {
          const videos = COMMUNITY_VIDEOS.filter((v) => v.category === category.key);
          return (
            <CategoryGroup
              key={category.key}
              category={category}
              videos={videos}
              defaultOpen={i === 0}
              visible={isVisible}
              onPlay={(url) => url && setPlayingUrl(url)}
            />
          );
        })}
      </div>

      {/* Video modal */}
      {playingUrl && (
        <VideoModal url={playingUrl} onClose={() => setPlayingUrl(null)} />
      )}
    </section>
  );
}
