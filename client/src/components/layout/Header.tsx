/**
 * Component: Header
 * Responsibility: sticky header with the logo, the navigation and the mobile
 * hamburger toggle.
 * Port of initNavToggle() + initStickyHeader() + initScrollSpy() from the legacy
 * js/app.js, now expressed as state instead of class manipulation.
 *
 * The four ways the menu closes are all preserved: tapping a link, pressing
 * Escape (which also returns focus to the toggle, so the keyboard user is not
 * dropped at the top of the document), and crossing the 900px breakpoint where
 * the nav becomes permanently visible.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { NAV_LINKS, SITE } from '../../content/site.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { useScrollSpy } from '../../hooks/useScrollSpy.js';
import { useStickyHeader } from '../../hooks/useStickyHeader.js';
import { LogoMark } from '../ui/Icon.js';

/** Same breakpoint as the CSS: above it the nav is always laid out horizontally. */
const DESKTOP_QUERY = '(min-width: 900px)';

/** Sections watched by the scroll spy, in document order. */
const SPY_SECTION_IDS = NAV_LINKS.map((link) => link.id);

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = useStickyHeader();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const activeSection = useScrollSpy(SPY_SECTION_IDS);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeNav = useCallback(() => setIsOpen(false), []);

  // Growing past the breakpoint makes "open" meaningless — the nav is visible
  // either way — so reset it, or the hamburger would show as expanded when the
  // viewport shrinks back.
  useEffect(() => {
    if (isDesktop) closeNav();
  }, [isDesktop, closeNav]);

  // Escape closes the menu and hands focus back to the button that opened it.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      closeNav();
      toggleRef.current?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeNav]);

  return (
    <header className={`header${isScrolled ? ' is-scrolled' : ''}`} id="header">
      <div className="container header__inner">
        <a className="logo" href="#hero" aria-label={`${SITE.name}, ir al inicio`}>
          <LogoMark />
          <span className="logo__text">
            {SITE.nameParts.first}
            <span className="logo__accent">{SITE.nameParts.second}</span>
          </span>
        </a>

        <nav
          className={`nav${isOpen ? ' is-open' : ''}`}
          id="nav"
          aria-label="Navegación principal"
          // Closing on any link click covers the whole list with one handler,
          // exactly as the legacy delegated listener did.
          onClick={closeNav}
        >
          <ul className="nav__list">
            {NAV_LINKS.map((link) => (
              <li className="nav__item" key={link.id}>
                <a
                  className={`nav__link${activeSection === link.id ? ' is-active' : ''}`}
                  href={`#${link.id}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="nav__item nav__item--cta">
              <a className="btn btn--primary btn--sm" href="#contacto">
                Pedir presupuesto
              </a>
            </li>
          </ul>
        </nav>

        <button
          className="nav-toggle"
          id="navToggle"
          type="button"
          ref={toggleRef}
          aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={isOpen}
          aria-controls="nav"
          onClick={() => setIsOpen((open) => !open)}
        >
          {/* Three bars that the CSS morphs into an X, keyed off aria-expanded. */}
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
        </button>
      </div>
    </header>
  );
}
