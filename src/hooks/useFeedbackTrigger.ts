/**
 * Consumer hook for the global feedback modal.
 *
 * The modal itself is owned by <FeedbackProvider /> mounted once at the
 * layout level. Any component in the tree can call `openWith(ctx)` to
 * open it with optional pre-filled context (section reference, label,
 * meta snapshot).
 *
 * Passing no context gives the classic free-form "feed me log" entry
 * point. Passing `{ sectionRef }` or `{ meta }` (or both) produces a
 * contextual report that the reviewer can reproduce later.
 */

"use client";

import { createContext, useContext } from "react";
import type { FeedbackLabel, FeedbackMeta } from "@/lib/feedback-backlog";

export interface PendingContext {
  sectionRef?: string;
  label?: FeedbackLabel;
  meta?: FeedbackMeta;
}

export interface FeedbackTriggerValue {
  open: boolean;
  pending: PendingContext;
  openWith: (ctx?: PendingContext) => void;
  close: () => void;
  /**
   * Enter targeting mode: a green reticle follows the cursor, and the
   * next click anywhere on the page opens the modal with meta pinned to
   * the exact click target. `Esc` cancels. Used by Cmd+. and the PacMan
   * button so users can aim precisely. Section pills bypass this — they
   * already scope to a known target.
   */
  requestTarget: () => void;
  /** True while targeting mode is active. Consumers may render their
   *  own affordances (e.g. a dimmed state) while aiming. */
  targeting: boolean;
}

export const FeedbackTriggerContext = createContext<FeedbackTriggerValue | null>(null);

export function useFeedbackTrigger(): FeedbackTriggerValue {
  const ctx = useContext(FeedbackTriggerContext);
  if (!ctx) {
    // No provider in tree — return a no-op so callers don't have to
    // handle the null case. This happens e.g. in tests that render a
    // section without wrapping it.
    return {
      open: false,
      pending: {},
      openWith: () => {},
      close: () => {},
      requestTarget: () => {},
      targeting: false,
    };
  }
  return ctx;
}
