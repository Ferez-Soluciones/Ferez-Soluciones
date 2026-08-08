/**
 * Component: Footer
 * Responsibility: brand blurb, secondary navigation, contact links and copyright.
 * Port of initFooterYear() from the legacy js/app.js — the year is computed at
 * render time instead of being written into the DOM after load.
 */
import { FOOTER, SITE } from '../../content/site.js';
import { LogoMark } from '../ui/Icon.js';

export function Footer() {
  // Evaluated on every render, which for a landing page means once per visit.
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <a className="logo" href="#hero" aria-label={`${SITE.name}, ir al inicio`}>
            <LogoMark size={24} />
            <span className="logo__text">
              {SITE.nameParts.first}
              <span className="logo__accent">{SITE.nameParts.second}</span>
            </span>
          </a>
          <p className="footer__text">{FOOTER.text}</p>
        </div>

        <nav className="footer__nav" aria-label="Enlaces del pie de página">
          <h2 className="footer__heading">{FOOTER.navHeading}</h2>
          <ul className="footer__list">
            {FOOTER.navLinks.map((link) => (
              <li key={link.href}>
                <a className="footer__link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__contact">
          <h2 className="footer__heading">{FOOTER.contactHeading}</h2>
          <ul className="footer__list">
            <li>
              <a className="footer__link" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
            </li>
            <li>
              <a className="footer__link" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              <a className="footer__link" href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a className="footer__link" href={SITE.linkedinUrl} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <p className="footer__copy">
          © {year} {SITE.name}. Todos los derechos reservados.
        </p>
        <p className="footer__copy">{FOOTER.madeIn}</p>
      </div>
    </footer>
  );
}
