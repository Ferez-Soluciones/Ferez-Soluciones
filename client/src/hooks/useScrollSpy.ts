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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [key]);

  return activeId;
}
