"use client";

import type { ReactNode } from "react";
import { RailLogoTile } from "./Rail";

/* ─── Engagement library card ───
 *  Shared list row for the /cs/mine and /cs/browse pages. Shows logo,
 *  name, type + role badges, last-edited (relative), owner, and
 *  collaborators. The trailing action slot is caller-supplied
 *  (Open / View / Request edit access). */

function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const day = 86_400_000;
  if (diff < day) return "today";
  if (diff < 2 * day) return "yesterday";
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function domainFromUrl(url: string | null | undefined): string {
  return (url || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
}

function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "green" | "purple" }) {
  const cls =
    tone === "green"
      ? "bg-boost-green-light/12 text-boost-green"
      : tone === "purple"
        ? "bg-boost-purple/10 text-boost-purple"
        : "bg-boost-surface text-boost-muted";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${cls}`}>
      {children}
    </span>
  );
}

const AUDIENCE_LABEL: Record<string, string> = {
  "sales": "Sales",
  "customer-success": "CS",
  "customer-excellence": "CE",
  "professional-services": "PS",
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  collaborator: "Collaborator",
  other: "Viewer",
};

export function EngagementCard(props: {
  companyName: string | null;
  title: string | null;
  companyUrl: string | null;
  audience: string | null;
  ownerEmail: string;
  updatedAt: string;
  role: "owner" | "collaborator" | "other";
  collaborators?: string[];
  /** Trailing action(s) — e.g. Open / View / Request buttons. */
  action?: ReactNode;
  /** Optional whole-card click (e.g. open detail). */
  onClick?: () => void;
}) {
  const { companyName, title, companyUrl, audience, ownerEmail, updatedAt, role, collaborators = [], action, onClick } = props;
  const label = companyName || title || "Untitled engagement";
  const initials = label.trim()[0]?.toUpperCase() ?? "?";
  const dom = domainFromUrl(companyUrl);
  const src = dom ? `https://cdn.brandfetch.io/${dom}` : null;
  const collabCount = collaborators.length;

  return (
    <div
      className={
        "group flex items-center gap-3 rounded-xl border border-boost-border bg-white px-4 py-3 transition-shadow hover:shadow-sm" +
        (onClick ? " cursor-pointer" : "")
      }
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }
          : undefined
      }
    >
      <RailLogoTile src={src} initials={initials} alt={label} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold text-boost-dark truncate leading-tight">{label}</p>
          {audience ? <Badge tone="purple">{AUDIENCE_LABEL[audience] ?? audience}</Badge> : null}
          <Badge tone={role === "owner" ? "green" : "muted"}>{ROLE_LABEL[role]}</Badge>
        </div>
        <p className="text-[10px] text-boost-muted mt-1 truncate">
          {role === "owner" ? "You" : ownerEmail}
          <span className="mx-1.5">·</span>
          edited {relativeDate(updatedAt)}
          {collabCount > 0 ? (
            <>
              <span className="mx-1.5">·</span>
              {collabCount} collaborator{collabCount === 1 ? "" : "s"}
            </>
          ) : null}
        </p>
        {collabCount > 0 ? (
          <p className="text-[10px] text-boost-muted/70 mt-0.5 truncate">
            {collaborators.slice(0, 3).join(", ")}
            {collabCount > 3 ? ` +${collabCount - 3}` : ""}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex-shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>{action}</div> : null}
    </div>
  );
}
