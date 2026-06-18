"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { assetPath } from "@/lib/asset-path";

/* ──────────────────────────────────────────────────────────────
 *  Customer Success workspace — landing chooser (/cs)
 *
 *  Entry point for the CSM. Three doors: start a New engagement
 *  (the builder), open an Existing one (my engagements page), or
 *  Browse the whole shared library (everyone's engagements, with
 *  view-as-baseline + request-edit-access). Each door is its own
 *  route under the /cs/* proxy gate.
 * ────────────────────────────────────────────────────────────── */

function ChooserCard(props: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: ReactNode;
  primary?: boolean;
}) {
  const { href, eyebrow, title, body, icon, primary } = props;
  return (
    <Link
      href={href}
      className={
        "group relative flex flex-col rounded-2xl border p-6 transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light " +
        (primary
          ? "border-transparent bg-boost-purple text-white shadow-md hover:shadow-xl"
          : "border-boost-border bg-white hover:border-boost-purple/30")
      }
    >
      <span
        className={
          "flex items-center justify-center w-11 h-11 rounded-xl mb-4 " +
          (primary ? "bg-white/15 text-white" : "bg-boost-surface text-boost-purple")
        }
      >
        {icon}
      </span>
      <p
        className={
          "text-[9px] font-bold uppercase tracking-[0.18em] mb-1.5 " +
          (primary ? "text-white/70" : "text-boost-muted")
        }
      >
        {eyebrow}
      </p>
      <h2 className={"text-lg font-semibold leading-tight tracking-tight " + (primary ? "text-white" : "text-boost-dark")}>
        {title}
      </h2>
      <p className={"text-[13px] leading-relaxed mt-2 flex-1 " + (primary ? "text-white/80" : "text-boost-muted")}>
        {body}
      </p>
      <span
        className={
          "mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] " +
          (primary ? "text-white" : "text-boost-purple")
        }
      >
        Open
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}

export default function CsHomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-boost-surface">
      {/* CSM banner */}
      <div className="bg-boost-purple text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
            Customer Success
          </span>
          <div className="flex items-center gap-3 flex-shrink-0">
            {session?.user?.email ? (
              <span className="hidden md:inline text-[10px] font-medium tracking-[0.04em] text-white/60 truncate max-w-[160px]">
                {session.user.email}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-boost-purple rounded-sm px-2 py-0.5 whitespace-nowrap"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-boost-border bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Back to workspace picker"
            className="flex-shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 hover:opacity-80 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assetPath("/brand/boost_logo_purple-_main.svg")} alt="boost.ai" className="h-5 sm:h-6 w-auto" />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-boost-dark">
            Customer Success workspace
          </h1>
          <p className="text-[14px] text-boost-muted mt-2 max-w-xl">
            Build a Business Review, pick up where you left off, or browse the whole team&rsquo;s
            engagements.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <ChooserCard
            href="/cs/build"
            eyebrow="Start fresh"
            title="New engagement"
            body="Open a blank builder and author a new customer review from scratch."
            primary
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            }
          />
          <ChooserCard
            href="/cs/mine"
            eyebrow="Continue"
            title="Existing engagement"
            body="Reopen an engagement you own or collaborate on. See owners, collaborators and last edits."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h6l2 2h8v12H4z" /></svg>
            }
          />
          <ChooserCard
            href="/cs/browse"
            eyebrow="Library"
            title="Browse all engagements"
            body="Search and filter every engagement across the team. View any, request edit access to others&rsquo;."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            }
          />
        </div>
      </main>
    </div>
  );
}
