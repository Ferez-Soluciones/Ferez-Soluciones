/**
 * Hook: useScrollSpy
 * Port of initScrollSpy() from the legacy js/app.js.
 *
 * Highlights the nav link of the section currently in view. The rootMargin
 * shrinks the observation area to a thin band across the middle of the viewport
 * (-45% top, -50% bottom), so a section only counts as "current" once it truly
 * dominates the screen — otherwise every section near the fold would flicker
 * the active state back and forth.
 */
import { useEffect, useState } from 'react';

/**
 * Tracks which of the given sections is currently in view.
 *
 * @param sectionIds - Ids of the sections to watch, in document order.
 * @returns The id of the active section, or an empty string before any match.
 */
export function useScrollSpy(sectionIds: readonly string[]): string {
  const [activeId, setActiveId] = useState('');

  // Joined into a primitive so the effect does not re-run on every render just
  // because the caller passed a new array literal.
  const key = sectionIds.join(',');

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const sections = key
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    // Tracks what the observer last reported per section, because a callback
    // only carries the entries that CHANGED — deciding which section wins from a
    // partial batch is how the highlight ends up on the wrong item.
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestId = '';
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestId = id;
            bestRatio = ratio;
          }
        }

        // Falls back to '' when nothing is in the band — otherwise the last
        // section stays highlighted while the visitor reads the footer.
        setActiveId(bestId);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [key]);

  return activeId;
}
