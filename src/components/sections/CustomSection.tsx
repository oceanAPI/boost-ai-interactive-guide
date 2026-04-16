"use client";

import { useState } from "react";
import type { GuideData } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import VideoModal, { getVideoThumb } from "@/components/VideoModal";

export default function CustomSection({ guide }: { guide: GuideData }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [videoOpen, setVideoOpen] = useState(false);

  const cs = guide.custom_section;
  if (!cs?.title) return null;

  const paragraphs = cs.body
    ? cs.body.split("\n\n").filter((p) => p.trim())
    : [];

  const thumb = cs.video_url ? getVideoThumb(cs.video_url) : null;

  return (
    <section>
      <SectionHeader title={cs.title} />

      <div
        ref={ref}
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Editorial layout — generous spacing, magazine feel */}
        <div className="space-y-10">
          {/* Body text */}
          {paragraphs.length > 0 && (
            <div className="max-w-2xl space-y-5">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-[15px] leading-relaxed text-boost-dark/85"
                >
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* Image */}
          {cs.image_url && (
            <div className="rounded-xl overflow-hidden border border-boost-border shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cs.image_url}
                alt={cs.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Video thumbnail with play button */}
          {cs.video_url && (
            <>
              <button
                onClick={() => setVideoOpen(true)}
                className="group relative w-full max-w-2xl rounded-xl overflow-hidden border border-boost-border shadow-sm hover:shadow-md transition-shadow"
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt="Video thumbnail"
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video bg-boost-dark flex items-center justify-center">
                    <span className="text-sm text-white/50">Video</span>
                  </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-boost-dark ml-1"
                    >
                      <polygon points="6,4 20,12 6,20" />
                    </svg>
                  </div>
                </div>
              </button>

              {videoOpen && (
                <VideoModal
                  url={cs.video_url}
                  onClose={() => setVideoOpen(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
