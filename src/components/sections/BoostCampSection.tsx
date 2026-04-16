"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import VideoModal, { getVideoThumb } from "@/components/VideoModal";
import { assetPath } from "@/lib/asset-path";
import {
  BOOST_CAMP_LOCATIONS,
  locationHasUpcoming,
  type BoostCampLocation,
} from "@/data/boost-camp-events";
import LocationPopup from "./boost-camp/LocationPopup";

/**
 * Boost Camp — the annual boost.ai customer event.
 * Customers, partners, and prospects gather to share success stories,
 * hear the product roadmap, and meet the boost.ai team + the wider community.
 */

const RECAP_VIDEO_URL = "https://www.youtube.com/watch?v=ltRLSIC8lXA";

interface Pillar {
  eyebrow: string;
  title: string;
  body: string;
}

const PILLARS: Pillar[] = [
  {
    eyebrow: "Hear the roadmap first",
    title: "Product vision, straight from the source",
    body: "Every Boost Camp opens with a full walkthrough of what's shipping — NOW, SOON, and LATER. You get the roadmap in person, with time to ask product leaders the hard questions.",
  },
  {
    eyebrow: "Success, in their own words",
    title: "Real customer stories",
    body: "Peers share what worked, what didn't, and what they'd do differently. Banks, insurers, pension providers, fintechs — side-by-side, trading notes. The kind of honesty you only get in the room.",
  },
  {
    eyebrow: "Meet the community",
    title: "The people behind the platform",
    body: "Product managers, engineers, AI trainers, your account team, and peer customers — one venue, two days. Many of our biggest product decisions start as hallway conversations at Boost Camp.",
  },
];

/* ─── Hero with video thumbnail + play ─── */
function EventHero({ onPlay, visible }: { onPlay: () => void; visible: boolean }) {
  const thumb = getVideoThumb(RECAP_VIDEO_URL);

  return (
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        background: "linear-gradient(135deg, #3a1a40 0%, #59195d 45%, #451149 100%)",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Left — copy */}
        <div className="lg:col-span-3 px-7 py-10 sm:px-10 sm:py-14 lg:py-16 relative z-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-boost-green-light">
            The annual event
          </p>
          <h3 className="mt-3 text-3xl sm:text-4xl lg:text-[44px] font-bold text-white leading-[1.08] tracking-tight">
            Two days. One community.<br className="hidden sm:block" />
            The roadmap, in the room.
          </h3>
          <p className="mt-5 text-[14px] sm:text-[15px] text-white/75 leading-[1.7] max-w-[52ch]">
            Boost Camp is our annual gathering for customers, partners, and
            prospects — the place where the boost.ai community shares success
            stories, hears the product roadmap straight from the team, and
            meets the people building the platform.
          </p>

          {/* CTA row */}
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={onPlay}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white text-boost-dark hover:bg-white/90 transition-colors shadow-lg shadow-black/20"
            >
              <span className="w-7 h-7 rounded-full bg-boost-green-light flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white" className="ml-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="text-sm font-semibold">Watch the recap</span>
            </button>
            <span className="text-[12px] text-white/55">
              Ask your account manager about this year&rsquo;s dates
            </span>
          </div>
        </div>

        {/* Right — video thumb */}
        <button
          type="button"
          onClick={onPlay}
          aria-label="Play Boost Camp recap video"
          className="lg:col-span-2 relative aspect-video lg:aspect-auto group cursor-pointer overflow-hidden"
        >
          {/* Thumbnail */}
          {thumb && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt="Boost Camp recap"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {/* Tint + play */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#3a2d40" className="ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          {/* Corner meta */}
          <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded-md bg-black/55 text-[11px] font-semibold text-white backdrop-blur-sm">
            Watch recap
          </span>
        </button>
      </div>
    </div>
  );
}

/* ─── World map with clickable event locations ─── */

function WorldMap({ visible }: { visible: boolean }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openLocation, setOpenLocation] = useState<BoostCampLocation | null>(null);

  return (
    <>
      <div
        className="relative overflow-hidden rounded-2xl border border-boost-border/60 bg-boost-surface/40 transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transitionDelay: "600ms",
        }}
      >
        {/* Subtle header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-boost-border/60">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
              Around the community
            </p>
            <p className="text-sm font-semibold text-boost-dark mt-0.5">
              Click a city to see the events and speakers
            </p>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-boost-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-boost-purple" />
              Past
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-boost-green-light ring-2 ring-boost-green-light/20" />
              Upcoming
            </span>
          </div>
        </div>

        {/* Map */}
        <div className="relative aspect-[16/9] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetPath("/images/world-map.svg")}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-contain opacity-[0.08] p-4"
          />

          {/* Location markers — one per city, aggregates events */}
          {BOOST_CAMP_LOCATIONS.map((loc) => {
            const isHovered = hoveredId === loc.id;
            const hasUpcoming = locationHasUpcoming(loc);
            const eventCount = loc.events.length;
            return (
              <div
                key={loc.id}
                className="absolute"
                style={{
                  left: `${loc.x}%`,
                  top: `${loc.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: isHovered ? 20 : 10,
                }}
                onMouseEnter={() => setHoveredId(loc.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Ripple ring for locations with upcoming events */}
                {hasUpcoming && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-boost-green-light/30 animate-ping pointer-events-none" />
                )}

                {/* Clickable dot button */}
                <button
                  type="button"
                  onClick={() => setOpenLocation(loc)}
                  aria-label={`${loc.city}, ${loc.country} — ${eventCount} event${eventCount === 1 ? "" : "s"}`}
                  className={`relative block rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-boost-green-light ${
                    hasUpcoming
                      ? "bg-boost-green-light ring-2 ring-boost-green-light/25"
                      : "bg-boost-purple ring-2 ring-boost-purple/20"
                  } ${isHovered ? "scale-[1.5] shadow-lg" : ""}`}
                  style={{
                    width: eventCount > 1 ? "14px" : "11px",
                    height: eventCount > 1 ? "14px" : "11px",
                  }}
                >
                  {/* Count badge for locations with multiple events */}
                  {eventCount > 1 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white leading-none">
                      {eventCount}
                    </span>
                  )}
                </button>

                {/* Hover tooltip */}
                {isHovered && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 rounded-md bg-boost-dark text-white shadow-lg text-[11px] whitespace-nowrap pointer-events-none">
                    <p className="font-semibold">{loc.city}, {loc.country}</p>
                    <p className="text-white/60 text-[10px] mt-0.5">
                      {eventCount} event{eventCount === 1 ? "" : "s"} · click to view
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer — compact list of all events across locations, newest first */}
        <div className="px-6 py-4 border-t border-boost-border/60 bg-white/50">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {BOOST_CAMP_LOCATIONS.flatMap((loc) =>
              loc.events.map((e) => ({
                year: e.year,
                status: e.status,
                city: loc.city,
                locId: loc.id,
                eventId: e.id,
                loc,
              })),
            )
              .sort((a, b) => Number(b.year) - Number(a.year))
              .map((row) => {
                const isUpcoming = row.status === "upcoming";
                return (
                  <button
                    key={row.eventId}
                    type="button"
                    onClick={() => setOpenLocation(row.loc)}
                    className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isUpcoming ? "bg-boost-green-light" : "bg-boost-purple"
                      }`}
                    />
                    <span className="text-[11px] text-boost-dark font-medium">
                      {row.year}
                    </span>
                    <span className="text-[11px] text-boost-muted">{row.city}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Popup — opens on dot click */}
      {openLocation && (
        <LocationPopup
          location={openLocation}
          onClose={() => setOpenLocation(null)}
        />
      )}
    </>
  );
}

/* ─── Pillar column ─── */
function PillarColumn({ pillar, delay, visible }: { pillar: Pillar; delay: number; visible: boolean }) {
  return (
    <div
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-green">
        {pillar.eyebrow}
      </p>
      <h4 className="mt-2 text-base sm:text-lg font-semibold text-boost-dark leading-snug">
        {pillar.title}
      </h4>
      <p className="mt-2.5 text-sm text-boost-text-secondary leading-relaxed">
        {pillar.body}
      </p>
    </div>
  );
}

/* ─── Main ─── */
export default function BoostCampSection({ sectionNumber }: { sectionNumber?: string }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [playing, setPlaying] = useState(false);

  return (
    <section ref={ref}>
      <SectionHeader
        number={sectionNumber ?? "08"}
        title="Boost Camp"
        subtitle="The annual gathering for boost.ai customers, partners, and prospects"
      />

      {/* Hero band with recap video */}
      <EventHero onPlay={() => setPlaying(true)} visible={isVisible} />

      {/* Three-up pillar explanation */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
        {PILLARS.map((p, i) => (
          <PillarColumn
            key={p.eyebrow}
            pillar={p}
            delay={300 + i * 120}
            visible={isVisible}
          />
        ))}
      </div>

      {/* World map of past + upcoming events */}
      <div className="mt-12">
        <WorldMap visible={isVisible} />
      </div>

      {/* Video modal */}
      {playing && (
        <VideoModal url={RECAP_VIDEO_URL} onClose={() => setPlaying(false)} />
      )}
    </section>
  );
}
