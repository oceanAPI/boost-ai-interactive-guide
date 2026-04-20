/**
 * Inline "add comment" affordance that mounts inside a section.
 *
 * Currently rendered as a no-op. Section-level feedback is now captured
 * exclusively via the global ⌘/Ctrl+. shortcut (aim-then-click targeting
 * mode in FeedbackBacklog.tsx), which pins the report to the exact
 * element under the cursor — no persistent visual affordance is needed.
 *
 * The component signature is kept intact so the ~20 call sites in
 * GuideClient.tsx stay semantic and re-enabling a visible pill in the
 * future is a single-file change. All side effects (portal, observers,
 * pointer / focus / scroll listeners) are skipped.
 */

"use client";

interface Props {
  sectionId: string;
  offset?: { top?: number; right?: number };
  displayName?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SectionReportPill(_props: Props) {
  return null;
}
