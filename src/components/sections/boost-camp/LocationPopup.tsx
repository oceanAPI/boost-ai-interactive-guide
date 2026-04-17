"use client";

import { useEffect, useRef, useState } from "react";
import type {
  BoostCampLocation,
  BoostCampEvent,
  EventSpeaker,
} from "@/data/boost-camp-events";
import { logoUrlForCompany } from "@/data/boost-camp-events";

/* ─── Speaker row — company logo on the left, clean typography on the right ─── */
function SpeakerRow({ speaker }: { speaker: EventSpeaker }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const logoUrl = logoUrlForCompany(speaker.company);
  const showLogo = logoUrl && !logoFailed;

  const initials = speaker.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Tiny colour dot — subtle kind signal without a loud pill
  const kindDot =
    speaker.kind === "customer"
      ? "bg-boost-green-light"
      : speaker.kind === "analyst"
        ? "bg-boost-purple"
        : speaker.kind === "partner"
          ? "bg-boost-gold"
          : "bg-boost-muted";

  return (
    <div className="flex items-start gap-3.5 py-3 border-b border-boost-border/50 last:border-b-0">
      {/* Logo or initials — same footprint */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-boost-border/60 flex items-center justify-center overflow-hidden">
        {showLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="w-full h-full object-contain p-1"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="text-[10px] font-bold text-boost-muted/70 tracking-wider">
            {initials}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-boost-dark leading-tight truncate">
            {speaker.name}
          </p>
          {/* Tiny kind dot — subtle, readable at glance without shouting */}
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${kindDot}`} aria-hidden="true" />
        </div>
        <p className="text-xs text-boost-muted mt-0.5">
          {speaker.role}
          {speaker.name !== speaker.company && (
            <> · <span className="text-boost-dark font-medium">{speaker.company}</span></>
          )}
        </p>
        {speaker.topic && (
          <p className="text-[11px] text-boost-text-secondary italic mt-1 leading-relaxed">
            &ldquo;{speaker.topic}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Single event card ─── */
function EventCard({ event }: { event: BoostCampEvent }) {
  const isUpcoming = event.status === "upcoming";
  const accent = isUpcoming ? "bg-boost-green-light" : "bg-boost-purple";
  const accentText = isUpcoming ? "text-boost-green" : "text-boost-purple";

  return (
    <div className="relative pl-5">
      {/* Left accent stripe */}
      <span className={`absolute left-0 top-1 bottom-1 w-[2px] rounded-full ${accent}`} />

      {/* Event meta */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${accentText}`}>
          {isUpcoming ? "Upcoming" : "Past event"}
        </span>
        <span className="text-boost-border">·</span>
        <span className="text-xs font-semibold text-boost-dark tabular-nums">
          {event.year}
        </span>
        {event.date && (
          <>
            <span className="text-boost-border">·</span>
            <span className="text-[11px] text-boost-muted">{event.date}</span>
          </>
        )}
      </div>

      {/* Theme */}
      {event.theme && (
        <h4 className="text-base sm:text-lg font-bold text-boost-dark leading-snug">
          {event.theme}
        </h4>
      )}

      {/* Venue */}
      {event.venue && (
        <p className="text-[11px] text-boost-muted mt-1">{event.venue}</p>
      )}

      {/* Speakers list */}
      {event.speakers.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted mb-1">
            Speakers
          </p>
          <div>
            {event.speakers.map((sp) => (
              <SpeakerRow key={`${sp.name}-${sp.company}`} speaker={sp} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state for upcoming-without-speakers */}
      {event.speakers.length === 0 && (
        <div className="mt-4 py-4 px-4 rounded-lg bg-boost-surface/60 text-center">
          <p className="text-[11px] text-boost-muted">
            {isUpcoming
              ? "Speaker lineup being finalised"
              : "Speaker list coming soon"}
          </p>
        </div>
      )}

      {/* Draft badge */}
      {event.draft && (
        <p className="mt-4 text-[10px] text-boost-muted/70 italic">
          Draft — confirming remaining speakers
        </p>
      )}
    </div>
  );
}

/* ─── Main popup ─── */
interface LocationPopupProps {
  location: BoostCampLocation;
  onClose: () => void;
}

export default function LocationPopup({ location, onClose }: LocationPopupProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => modalRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [onClose]);

  // Sort events newest → oldest
  const sortedEvents = [...location.events].sort(
    (a, b) => Number(b.year) - Number(a.year),
  );

  const eventCount = location.events.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8" role="presentation">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-popup-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-2xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-modal-in focus:outline-none"
      >
        {/* Header band — dark purple matching the hero */}
        <div
          className="sticky top-0 z-10 sm:rounded-t-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(75,30,82,0.97) 0%, rgba(55,22,62,1) 100%)",
          }}
        >
          <div className="px-5 sm:px-7 pt-5 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Eyebrow */}
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-boost-green-light">
                  Boost Camp
                </p>

                {/* City heading */}
                <h3
                  id="location-popup-title"
                  className="mt-1.5 text-2xl sm:text-3xl font-bold text-white leading-tight"
                >
                  {location.city}
                  <span className="text-white/50 font-medium">, {location.country}</span>
                </h3>

                {/* Event count */}
                <p className="text-[12px] sm:text-sm text-white/60 mt-1.5">
                  {eventCount} event{eventCount === 1 ? "" : "s"} · {location.events.map((e) => e.year).join(", ")}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/90 transition-colors flex-shrink-0 -mt-0.5"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Body — stacked event cards */}
        <div className="px-5 sm:px-7 py-6 space-y-8">
          {sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
