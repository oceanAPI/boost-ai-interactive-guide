"use client";

/**
 * Dashed vertical connector line between flow diagram rows.
 * Purely decorative — rendered as a centered div with a dashed border.
 */
export default function FlowConnector({ height = 28 }: { height?: number }) {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <div
        className="w-px border-l-2 border-dashed border-boost-green-light/30"
        style={{ height }}
      />
    </div>
  );
}
