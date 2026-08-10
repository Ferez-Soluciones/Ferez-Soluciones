/**
 * Section: Hero
 * Responsibility: the first screen — headline, CTAs and the browser mockup.
 *
 * Rendered entirely from static content (see content/site.ts). This is the only
 * section that deliberately never waits on the API: it is what the visitor sees
 * first, and Largest Contentful Paint should not depend on a round trip.
 *
 * The mockup is a decorative composition of CSS gradients and skeleton shapes,
 * not an image, so it is exposed as a single `role="img"` with a description
 * rather than as a pile of meaningless divs.
 */
import { HERO } from '../../content/site.js';
import { useReveal } from '../../hooks/useReveal.js';

export function Hero() {
  return (
    // aria-labelledby points at the h1 so the hero is a NAMED region in the
    // landmark list, like every other section. It was the only unnamed one.
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="eyebrow" data-reveal ref={useReveal<HTMLParagraphElement>()}>
            {HERO.eyebrow}
          </p>

          <h1 className="hero__title" id="hero-title" data-reveal ref={useReveal<HTMLHeadingElement>()}>
            {HERO.titleBefore}
            <span className="text-gradient">{HERO.titleHighlight}</span>
            {HERO.titleAfter}
          </h1>

          <p className="hero__lead" data-reveal ref={useReveal<HTMLParagraphElement>()}>
            {HERO.lead}
          </p>

          <div className="hero__actions" data-reveal ref={useReveal<HTMLDivElement>()}>
            <a className="btn btn--primary" href="#contacto">
              {HERO.primaryCta}
            </a>
            <a className="btn btn--secondary" href="#portfolio">
              {HERO.secondaryCta}
            </a>
          </div>

          <ul className="hero__badges" data-reveal ref={useReveal<HTMLUListElement>()}>
            {HERO.badges.map((badge) => (
              <li className="hero__badge" key={badge}>
                {badge}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__visual" data-reveal ref={useReveal<HTMLDivElement>()}>
          <div
            className="browser"
            role="img"
            aria-label="Vista previa de una landing page diseñada por Ferez Soluciones"
          >
            <div className="browser__bar">
              <span className="browser__dot" />
              <span className="browser__dot" />
              <span className="browser__dot" />
              <span className="browser__url">{HERO.mockupUrl}</span>
            </div>
            <div className="browser__screen">
              <div className="skeleton skeleton--title" />
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line skeleton--short" />
              <div className="skeleton skeleton--btn" />
              <div className="browser__grid">
                <div className="skeleton skeleton--card" />
                <div className="skeleton skeleton--card" />
                <div className="skeleton skeleton--card" />
              </div>
            </div>
          </div>

          {HERO.floatingStats.map((stat, index) => (
            <div className={`floating-stat floating-stat--${index === 0 ? 'a' : 'b'}`} key={stat.label}>
              <strong className="floating-stat__value">{stat.value}</strong>
              <span className="floating-stat__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
