"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import VideoModal, { getVideoThumb } from "@/components/VideoModal";
import { BOOST_CAMP_VIDEOS, type BoostCampVideo } from "@/data/boost-camp-videos";

const CATEGORIES = ["All", "Getting Started", "Platform", "Best Practices"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

function VideoCard({
  video,
  index,
  visible,
  onPlay,
}: {
  video: BoostCampVideo;
  index: number;
  visible: boolean;
  onPlay: () => void;
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
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transitionProperty: "opacity, transform, box-shadow",
        transitionDuration: "500ms",
        transitionDelay: `${100 + index * 80}ms`,
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
          // Branded placeholder when no URL yet
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse at 20% 0%, rgba(89,25,93,0.35), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(54,181,149,0.25), transparent 55%), linear-gradient(135deg, #3a1a40 0%, #2a1530 100%)",
            }}
          >
            {/* Soft dots pattern */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            {/* Category chip */}
            <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.15em] font-semibold text-white/70 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {video.category}
            </span>
            {/* Lock/coming-soon icon */}
            <div className="flex flex-col items-center gap-1.5 relative z-10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-white/50">
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

export default function BoostCampSection({ sectionNumber }: { sectionNumber?: string }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  const filtered =
    activeCategory === "All"
      ? BOOST_CAMP_VIDEOS
      : BOOST_CAMP_VIDEOS.filter((v) => v.category === activeCategory);

  return (
    <section>
      <SectionHeader
        number={sectionNumber ?? "07"}
        title="Boost Camp"
        subtitle="On-demand training videos to help your team master the boost.ai platform"
      />

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border ${
                isActive
                  ? "bg-boost-purple text-white border-boost-purple shadow-sm"
                  : "bg-white text-boost-muted border-boost-border hover:border-boost-purple/40 hover:text-boost-purple"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Video grid */}
      <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filtered.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            index={i}
            visible={isVisible}
            onPlay={() => setPlayingUrl(video.url)}
          />
        ))}
      </div>

      {/* Video modal */}
      {playingUrl && (
        <VideoModal url={playingUrl} onClose={() => setPlayingUrl(null)} />
      )}
    </section>
  );
}
