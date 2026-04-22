/* ──────────────────────────────────────────────────────────────
 *  Slideshow bridge — pub-sub for cross-tree slide state
 *
 *  FeedbackProvider wraps every route via `src/app/layout.tsx`, and
 *  therefore sits ABOVE SlideshowClient in the component tree.
 *  React context flows parent → child, so a context set by
 *  SlideshowClient is invisible to FeedbackProvider's descendants
 *  (PinDropOverlay, the right rail, the visual-recall flash).
 *
 *  This bridge is a plain pub-sub store that SlideshowClient writes
 *  into on mount / slide-change / unmount, and that the feedback
 *  layer reads via `useSyncExternalStore`. When a snapshot is
 *  present the feedback layer switches to slides-mode semantics
 *  (rail shows slide progress, pin ticks use slideIndex instead
 *  of pageY, tick-clicks call goToSlide). When absent, scroll-mode.
 *
 *  Not a global for global's sake — a deliberate single-writer,
 *  many-reader channel between two routes that share an ancestor
 *  but can't see each other's context.
 * ────────────────────────────────────────────────────────────── */

export interface SlideshowSnapshot {
  /** Total slide count (i.e. `sectionIds.length`). */
  total: number;
  /** 0-indexed current slide. */
  currentIndex: number;
  /** Imperative navigator. The feedback layer calls this when the
   *  user clicks a pin tick on the rail while in slides mode. */
  goToSlide: (index: number) => void;
}

let snapshot: SlideshowSnapshot | null = null;
const listeners = new Set<() => void>();

/** Install or update the snapshot. Pass `null` on unmount. */
export function setSlideshow(next: SlideshowSnapshot | null): void {
  snapshot = next;
  listeners.forEach((l) => l());
}

/** Read the current snapshot. `null` means we're not on /slides. */
export function getSlideshow(): SlideshowSnapshot | null {
  return snapshot;
}

/** Subscribe to change events. Returns an unsubscribe fn. Designed
 *  for `useSyncExternalStore`. */
export function subscribeSlideshow(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
