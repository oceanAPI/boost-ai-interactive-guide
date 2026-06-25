"use client";

import { useEffect } from "react";
import { loadActiveSuppressions } from "@/app/actions/cs-learnings";
import { setActiveLearned } from "@/lib/cs-engine/suggestions";

/**
 * Hydrate the engine's module-level ACTIVE mute list once on mount, so the
 * operator-curated global suppression list applies for the whole team in every
 * CS builder panel. The /cs/analytics page manages its own hydration (it also
 * needs the set in React state to recompute live), so this hook covers the
 * builder surfaces — CsChrome (/cs/mine, /cs/browse) and /cs/build.
 *
 * The set lands in a module-level cache; the pure suggest* functions read it as
 * their default, so panels pick it up on their next render after hydration.
 * Degrades silently to empty when not signed in or the 0005 table is absent.
 */
export function useLearningsHydration(): void {
  useEffect(() => {
    let live = true;
    void loadActiveSuppressions().then((res) => {
      if (!live || !res.ok) return;
      setActiveLearned({
        stories: new Set(res.data.stories),
        recommendations: new Set(res.data.recommendations),
        agentic: new Set(res.data.agentic),
        chapters: new Set(res.data.chapters),
      });
    });
    return () => {
      live = false;
    };
  }, []);
}
