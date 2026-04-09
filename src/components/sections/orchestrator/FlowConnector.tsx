"use client";

/**
 * Dashed vertical connector line between flow diagram nodes.
 * Matches the boost.ai admin panel's connection line style.
 */
export default function FlowConnector({ height = 32 }: { height?: number }) {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <div
        className="w-0 border-l-[1.5px] border-dashed"
        style={{ height, borderColor: "#b2dfdb" }}
      />
    </div>
  );
}

/**
 * Circular branch point icon (the loop/refresh icon at tree branch points).
 */
export function BranchPoint() {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <div className="w-7 h-7 rounded-full border-[1.5px] border-dashed flex items-center justify-center bg-white"
        style={{ borderColor: "#b2dfdb" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#208269" strokeWidth="2">
          <polyline points="1 4 1 10 7 10" />
          <polyline points="23 20 23 14 17 14" />
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
        </svg>
      </div>
    </div>
  );
}
