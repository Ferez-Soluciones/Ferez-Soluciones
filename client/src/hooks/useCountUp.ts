/**
 * Hook: useCountUp
 * Port of initCounters() from the legacy js/app.js.
 *
 * Animates a number from 0 to its target the first time it scrolls into view,
 * using requestAnimationFrame and the same cubic ease-out (1 - (1 - p)³) as the
 * original, so the count decelerates instead of running at constant speed.
 *
 * Under reduced motion the animation is skipped entirely and the final value is
 * rendered immediately — the information matters, the motion does not.
 */
import { useCallback, useEffect, useState } from 'react';

import { usePrefersReducedMotion } from './usePrefersReducedMotion.js';

/** Length of the count-up animation. */
const DURATION_MS = 1200;

/** How much of the element must be visible before counting starts. */
const VISIBILITY_THRESHOLD = 0.6;

interface CountUpResult<T extends HTMLElement> {
  /** Attach to the element that displays the number. */
  ref: (node: T | null) => void;
  /** The text to render, already including the suffix. */
  display: string;
}

/**
 * Counts up to `value` once the element becomes visible.
 *
 * @param value - Final number to reach.
 * @param suffix - Text appended after the number, e.g. "%" or " años".
 * @returns A ref callback and the string to render.
 */
export function useCountUp<T extends HTMLElement = HTMLElement>(
  value: number,
  suffix = ''
): CountUpResult<T> {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [current, setCurrent] = useState(() => (prefersReducedMotion ? value : 0));

  // The node is held in state, not a ref, so that attaching it re-runs the effect
  // below. Setting up the observer inside the ref callback instead — as an
  // earlier version did — could not survive StrictMode: React 18 re-runs effects
  // on the simulated remount but does NOT re-invoke ref callbacks, so the effect
  // cleanup disconnected an observer nobody would ever recreate and every counter
  // sat at 0 for good.
  const [node, setNode] = useState<T | null>(null);
  const ref = useCallback((next: T | null) => setNode(next), []);

  useEffect(() => {
    if (!node) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      setCurrent(value);
      return;
    }

    // Both handles are torn down together on cleanup. Releasing only the frame
    // left the observer alive on a detached node; releasing only the observer
    // left an unstoppable rAF loop calling setState after unmount.
    let frame: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        // One-shot: stop observing before animating so a fast scroll cannot
        // restart the count halfway through.
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION_MS, 1);
          const eased = 1 - Math.pow(1 - progress, 3);

          setCurrent(Math.round(value * eased));
          frame = progress < 1 ? requestAnimationFrame(tick) : null;
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: VISIBILITY_THRESHOLD }
    );

    observer.observe(node);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [node, value, prefersReducedMotion]);

  return { ref, display: `${current}${suffix}` };
}
