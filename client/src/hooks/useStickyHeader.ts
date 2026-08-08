/**
 * Hook: useStickyHeader
 * Port of initStickyHeader() from the legacy js/app.js.
 *
 * Returns whether the page has scrolled past a small threshold, so the header
 * can grow a border and a shadow only once content passes underneath it.
 */
import { useEffect, useState } from 'react';

/** Pixels of scroll before the header is considered "detached" from the top. */
const SCROLL_THRESHOLD = 12;

export function useStickyHeader(): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);

    // Run once so a page loaded already scrolled (a refresh, a deep link) gets
    // the right state instead of waiting for the first scroll event.
    update();

    // Passive: this listener never calls preventDefault, and saying so lets the
    // browser keep scrolling on the compositor thread.
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return isScrolled;
}
