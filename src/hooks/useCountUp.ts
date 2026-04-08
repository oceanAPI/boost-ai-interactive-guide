"use client";

import { useEffect, useState, useRef } from "react";

interface CountUpOptions {
  target: number;
  duration?: number; // ms
  enabled?: boolean; // typically tied to useScrollReveal.isVisible
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function useCountUp({
  target,
  duration = 1200,
  enabled = false,
  decimals = 0,
}: CountUpOptions) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!enabled || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      setValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, target, duration, decimals]);

  return value;
}
