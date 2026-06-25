"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { assetPath } from "@/lib/asset-path";

/* ──────────────────────────────────────────────────────────────
 *  Workspace landing (/home)
 *
 *  Top-level door picker. Two workspaces share one section
 *  catalogue and differ only by default-enabled sections:
 *  Sales (the prospect-facing builder) and Customer Success
 *  (the post-sale Business Review builder). Mirrors the /cs
 *  chooser layout.
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

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-boost-surface">
      {/* Banner */}
      <div className="bg-boost-purple text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
            Workspaces
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath("/brand/boost_logo_purple-_main.svg")} alt="boost.ai" className="h-5 sm:h-6 w-auto" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-boost-dark">
            Choose your workspace
          </h1>
          <p className="text-[14px] text-boost-muted mt-2 max-w-xl">
            Build a prospect-facing guide for Sales, or run a post-sale Business Review in
            Customer Success.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ChooserCard
            href="/sales"
            eyebrow="Pre-sale"
            title="Sales"
            body="Assemble a prospect-facing interactive guide: orchestrator, topics, demos, commercial offer and next steps."
            primary
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
            }
          />
          <ChooserCard
            href="/cs"
            eyebrow="Post-sale"
            title="Customer Success"
            body="Build a Business Review, pick up where you left off, or browse the whole team's engagements."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            }
          />
        </div>
      </main>
    </div>
  );
}
