"use client";
import { useEffect, useState } from "react";

export function useCountUp(target: number, duration: number = 800): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    const startTime = performance.now();
    const startValue = 0;
    
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(startValue + (target - startValue) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    
    requestAnimationFrame(tick);
  }, [target, duration]);

  return current;
}
