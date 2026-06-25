"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { assetPath } from "@/lib/asset-path";
import { useLearningsHydration } from "@/components/builder/useLearningsHydration";

/* ─── CSM page chrome ───
 *  Shared banner + header for the Customer Success sub-pages
 *  (/cs/mine, /cs/browse). The chooser (/cs) and builder (/cs/build)
 *  inline their own variants because their banners carry extra
 *  controls (save status, My-engagements link). */
export function CsChrome(props: { title: string; subtitle?: string; children: ReactNode }) {
  const { title, subtitle, children } = props;
  const { data: session } = useSession();
  useLearningsHydration();
  return (
    <div className="min-h-screen bg-boost-surface">
      <div className="bg-boost-purple text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <Link
            href="/cs"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 hover:text-white transition-colors"
          >
            ← Customer Success
          </Link>
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

      <header className="border-b border-boost-border bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
          <Link
            href="/cs"
            aria-label="Customer Success home"
            className="flex-shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 hover:opacity-80 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assetPath("/brand/boost_logo_purple-_main.svg")} alt="boost.ai" className="h-5 sm:h-6 w-auto" />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-boost-dark">{title}</h1>
          {subtitle ? <p className="text-[13px] text-boost-muted mt-1.5">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}
