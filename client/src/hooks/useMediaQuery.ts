/**
 * Hook: useMediaQuery
 * Port of the `window.matchMedia('(min-width: 900px)')` listener that the legacy
 * initNavToggle() used to close the mobile menu when the viewport grew.
 *
 * Reading the breakpoint in JavaScript duplicates a number that also lives in
 * the CSS, which is unavoidable: the desktop nav is always visible, so React has
 * to know when "the menu is open" stops being a meaningful state.
 */
import { useEffect, useState } from 'react';

/**
 * Tracks whether a media query currently matches.
 *
 * @param query - Any valid media query, e.g. "(min-width: 900px)".
 * @returns True while the query matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Re-sync on mount: the viewport may have changed between the initial state
    // and this effect running.
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
