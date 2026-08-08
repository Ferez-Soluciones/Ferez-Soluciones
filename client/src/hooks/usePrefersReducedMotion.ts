/**
 * Hook: usePrefersReducedMotion
 * Port of the `prefersReducedMotion` constant from the legacy js/app.js.
 *
 * The stylesheet already neutralises CSS animations for these users, but the
 * JavaScript effects (count-up, reveal, smooth scrolling) have to opt out too —
 * a counter ticking from 0 to 96 is motion no CSS rule can cancel.
 *
 * Unlike the legacy version this re-evaluates when the preference changes, so
 * toggling it in the OS takes effect without a reload.
 */
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
