"use client";

import { CompanyLogoChip } from "@/components/ui/CompanyLogoChip";

/**
 * Customer Dossier — a card-within-the-card for admin Section 1.
 * Builds a visual customer brief as the AE searches / prefills / types.
 * The raw form fields (company name, contact, date, etc.) live behind
 * an "Edit details" disclosure below this card.
 */

export interface CustomerDossierCardProps {
  companyName: string;
  companyUrl: string;
  contactName: string;
  contactRole: string;
  startDate: string;
  /** Logo URL (Brandfetch or curated). Falls back to domain-derived Brandfetch, then to an initials tile. */
  logoUrl?: string | null;
  /** Short description / category from the detection result. */
  summary?: string | null;
  /** Label for the "Prefilled from X" chip. When null, no chip shown. */
  prefilledLabel?: string | null;
  /** Called when the AE dismisses the prefilled chip. */
  onDismissPrefill?: () => void;
}

/** Derive a domain string from a URL, for display + Brandfetch fallback. */
function domainFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Friendly date formatting — "May 1, 2026". Returns empty string if unparseable. */
function formatStartDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Initials fallback when no logo is available. */
function initialsFrom(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CustomerDossierCard({
  companyName,
  companyUrl,
  contactName,
  contactRole,
  startDate,
  logoUrl,
  summary,
  prefilledLabel,
  onDismissPrefill,
}: CustomerDossierCardProps) {
  const domain = domainFromUrl(companyUrl);
  // Empty state — no company yet
  if (!companyName.trim()) {
    return (
      <div className="rounded-xl border border-dashed border-boost-border bg-boost-surface/30 px-5 py-8 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-boost-border mb-3">
          <svg
            className="w-4 h-4 text-boost-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <p className="text-sm font-medium text-boost-dark">Your customer dossier</p>
        <p className="text-xs text-boost-muted mt-1.5 leading-relaxed max-w-sm mx-auto">
          Search a company above, or expand <span className="font-semibold text-boost-dark">Edit details</span> below to enter manually.
        </p>
      </div>
    );
  }

  // Pick a logo source: explicit prop first, then Brandfetch from the domain
  const resolvedLogo = logoUrl || (domain ? `https://cdn.brandfetch.io/${domain}` : null);
  const description = summary?.trim();
  const formattedDate = formatStartDate(startDate);

  return (
    <div className="rounded-xl border border-boost-border bg-white shadow-sm overflow-hidden">
      {/* Header band: logo + name + summary + domain + optional prefilled chip */}
      <div className="px-5 py-4 flex items-start gap-4">
        {resolvedLogo ? (
          <CompanyLogoChip src={resolvedLogo} alt={`${companyName} logo`} size="lg" tone="light" />
        ) : (
          <div className="w-14 h-14 rounded-md bg-boost-purple/10 text-boost-purple flex items-center justify-center font-bold text-base shrink-0 ring-1 ring-boost-border/60">
            {initialsFrom(companyName)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="text-lg font-bold text-boost-dark leading-tight truncate">
              {companyName}
            </h3>
            {prefilledLabel && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-boost-green bg-boost-green-light/10 px-2 py-0.5 rounded shrink-0">
                <svg
                  className="w-2.5 h-2.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Prefilled · {prefilledLabel}
                {onDismissPrefill && (
                  <button
                    type="button"
                    onClick={onDismissPrefill}
                    className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                    aria-label="Dismiss prefill badge"
                  >
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </span>
            )}
          </div>

          {description && (
            <p className="text-sm text-boost-muted mt-1 leading-snug line-clamp-2">
              {description}
            </p>
          )}

          {domain && (
            <p className="text-xs text-boost-muted/80 mt-1 truncate">
              <a
                href={companyUrl.startsWith("http") ? companyUrl : `https://${companyUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-boost-dark hover:underline transition-colors"
              >
                {domain}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Meta row: contact + kickoff date — only shown when at least one is set */}
      {(contactName || contactRole || formattedDate) && (
        <>
          <div className="h-px bg-boost-border/60" />
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-boost-border/60">
            {/* Contact tile */}
            <div className="px-5 py-3 flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-boost-surface text-boost-muted flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.12em]">
                  Contact
                </p>
                <p className="text-sm font-semibold text-boost-dark truncate">
                  {contactName || <span className="text-boost-muted font-normal">Not set</span>}
                </p>
                {contactRole && (
                  <p className="text-xs text-boost-muted truncate">{contactRole}</p>
                )}
              </div>
            </div>
            {/* Kickoff tile */}
            <div className="px-5 py-3 flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-boost-surface text-boost-muted flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.12em]">
                  Kickoff
                </p>
                <p className="text-sm font-semibold text-boost-dark">
                  {formattedDate || <span className="text-boost-muted font-normal">Not set</span>}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
