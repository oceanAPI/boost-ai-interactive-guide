/**
 * Inline "add comment" affordance that mounts inside a section.
 *
 * The component itself renders only a zero-size <span> placeholder as a
 * React child of the section — its actual button is rendered via
 * createPortal to document.body and positioned using the section's
 * bounding rect. This means: zero layout impact on the parent section
 * (no forced position: relative), full support for dynamic reorders
 * (React tracks the placeholder), and clean teardown on unmount.
 */

"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useFeedbackTrigger } from "@/hooks/useFeedbackTrigger";
import { captureMeta } from "@/lib/feedback-meta";

interface Pos {
  top: number;
  left: number;
}

interface Props {
  sectionId: string;
  /** Optional offset from the section's top-right. Defaults to (8, 8). */
  offset?: { top?: number; right?: number };
  /** Tooltip / aria-label suffix. Defaults to sectionId. */
  displayName?: string;
}

// SSR-safe layout effect — collapses to useEffect on the server.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function SectionReportPill({ sectionId, offset, displayName }: Props) {
  const { openWith } = useFeedbackTrigger();
  const placeholderRef = useRef<HTMLSpanElement | null>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const rafRef = useRef<number | null>(null);

  const topOffset = offset?.top ?? 8;
  const rightOffset = offset?.right ?? 8;

  const schedule = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const anchor = placeholderRef.current?.parentElement;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      // Render nothing while the anchor is effectively invisible — no
      // size means no position worth computing.
      if (rect.width === 0 && rect.height === 0) {
        setPos(null);
        return;
      }
      setPos({
        top: rect.top + topOffset,
        left: rect.right - rightOffset,
      });
    });
  }, [topOffset, rightOffset]);

  useIsoLayoutEffect(() => {
    const placeholder = placeholderRef.current;
    const anchor = placeholder?.parentElement;
    if (!anchor) return;

    // Initial compute.
    schedule();

    // Resize of the anchor or its subtree — covers content changes,
    // collapsing sections, responsive reflow.
    const resizeObs = new ResizeObserver(() => schedule());
    resizeObs.observe(anchor);

    // Mutations in the anchor's parent tree — covers reorders within
    // a section list, add/remove siblings that shift our position.
    let mutObs: MutationObserver | null = null;
    if (anchor.parentElement) {
      mutObs = new MutationObserver(() => schedule());
      mutObs.observe(anchor.parentElement, {
        childList: true,
        subtree: false,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    // Parent hover / focus-within drives the pill's opacity. We
    // attach to the anchor directly rather than using CSS since the
    // pill lives outside the anchor (in a portal).
    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const onFocusIn = () => setVisible(true);
    const onFocusOut = () => {
      // Delay to allow focus to move to the pill button itself.
      setTimeout(() => {
        if (!anchor.matches(":focus-within")) setVisible(false);
      }, 0);
    };
    anchor.addEventListener("pointerenter", onEnter);
    anchor.addEventListener("pointerleave", onLeave);
    anchor.addEventListener("focusin", onFocusIn);
    anchor.addEventListener("focusout", onFocusOut);

    // Scroll / resize at the window level. Capture phase so we catch
    // every scrollable ancestor without having to enumerate them.
    const onScroll = () => schedule();
    const onResize = () => schedule();
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      resizeObs.disconnect();
      mutObs?.disconnect();
      anchor.removeEventListener("pointerenter", onEnter);
      anchor.removeEventListener("pointerleave", onLeave);
      anchor.removeEventListener("focusin", onFocusIn);
      anchor.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [schedule]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      try {
        openWith({ sectionRef: sectionId, meta: captureMeta() });
      } catch {
        openWith({ sectionRef: sectionId });
      }
    },
    [openWith, sectionId],
  );

  const label = displayName || sectionId;
  const shouldRender = pos !== null && (visible || focused);

  return (
    <>
      <span ref={placeholderRef} aria-hidden="true" style={{ display: "none" }} />
      {typeof document !== "undefined" && shouldRender
        ? createPortal(
            <button
              type="button"
              onClick={handleClick}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onPointerEnter={() => setVisible(true)}
              onPointerLeave={() => setVisible(false)}
              className="feedback-pill fixed z-40 w-7 h-7 rounded-full bg-boost-dark/85 hover:bg-boost-dark text-white shadow-md shadow-boost-dark/10 transition-opacity duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-1"
              style={{
                top: pos!.top,
                left: pos!.left,
                transform: "translate(-100%, 0)",
              }}
              aria-label={`Comment on ${label}`}
              title={`Comment on ${label}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </button>,
            document.body,
          )
        : null}
    </>
  );
}
