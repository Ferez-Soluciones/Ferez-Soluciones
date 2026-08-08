/**
 * Hook: useReveal
 * Port of initReveal() from the legacy js/app.js.
 *
 * Fades elements in as they enter the viewport. Two details are inherited from
 * the original on purpose:
 *
 * - A single shared IntersectionObserver rather than one per element. Every
 *   revealable node on the page registers here, which is both cheaper and what
 *   makes the stagger work: entries arriving in the same callback batch get
 *   increasing transition delays, so a row of cards cascades instead of popping.
 * - Elements are unobserved once revealed. The animation is a one-time entrance,
 *   not something that should replay on every scroll back up.
 *
 * The element keeps its `data-reveal` attribute — that is the CSS hook that sets
 * the initial hidden state; the observer only adds `is-visible`.
 */
import { useCallback, useRef } from 'react';

import { usePrefersReducedMotion } from './usePrefersReducedMotion.js';

/** Milliseconds added per element within the same intersection batch. */
const STAGGER_STEP_MS = 70;

let sharedObserver: IntersectionObserver | null = null;

/** Lazily creates the observer shared by every revealable element. */
function getSharedObserver(): IntersectionObserver {
  if (sharedObserver) return sharedObserver;

  sharedObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;

        const element = entry.target as HTMLElement;
        element.style.transitionDelay = `${index * STAGGER_STEP_MS}ms`;
        element.classList.add('is-visible');
        observer.unobserve(element);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  return sharedObserver;
}

/**
 * Returns a ref callback that reveals its element when it scrolls into view.
 *
 * Usage: `<p data-reveal ref={useReveal()}>…</p>`
 *
 * @returns A ref callback to spread onto any element that also carries `data-reveal`.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(): (node: T | null) => void {
  const prefersReducedMotion = usePrefersReducedMotion();
  const observedRef = useRef<T | null>(null);

  return useCallback(
    (node: T | null) => {
      // React calls the ref with null on unmount: stop observing the old node so
      // the shared observer does not keep detached elements alive.
      if (observedRef.current && observedRef.current !== node) {
        getSharedObserver().unobserve(observedRef.current);
        observedRef.current = null;
      }

      if (!node) return;

      // No animation wanted, or no observer available: show the content at once.
      // Never leave it at opacity 0, which is what the CSS defaults to.
      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        node.classList.add('is-visible');
        return;
      }

      observedRef.current = node;
      getSharedObserver().observe(node);
    },
    [prefersReducedMotion]
  );
}
