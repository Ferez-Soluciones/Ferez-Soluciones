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
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const frameRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * Tears down whatever is currently running.
   *
   * Both handles have to be released together. Keeping only the frame id — as an
   * earlier version did — left the observer alive on a detached node; keeping
   * only the observer left an unstoppable rAF loop calling setState after
   * unmount.
   */
  const stop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  // The ref callback below cannot clean up after itself on unmount, because
  // React calls it with null and there is nothing left to hang the teardown on.
  useEffect(() => stop, [stop]);

  const ref = useCallback(
    (node: T | null) => {
      // Always tear down first. React calls the ref with null on unmount AND
      // whenever this callback's identity changes (value or motion preference).
      // Skipping this on the null branch is what used to leave two observers on
      // the same element, each driving its own animation loop against the same
      // state — the number visibly jittered.
      stop();

      if (!node) return;

      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        setCurrent(value);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting) return;

          // One-shot: stop observing before animating so a fast scroll cannot
          // restart the count halfway through.
          observer.disconnect();
          observerRef.current = null;

          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / DURATION_MS, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            setCurrent(Math.round(value * eased));
            frameRef.current = progress < 1 ? requestAnimationFrame(tick) : null;
          };

          frameRef.current = requestAnimationFrame(tick);
        },
        { threshold: VISIBILITY_THRESHOLD }
      );

      observerRef.current = observer;
      observer.observe(node);
    },
    [value, prefersReducedMotion, stop]
  );

  return { ref, display: `${current}${suffix}` };
}
