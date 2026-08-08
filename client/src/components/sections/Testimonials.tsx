/**
 * Section: Testimonios
 * Responsibility: the three client quotes.
 * Data: GET /api/testimonials
 *
 * Marked up as `<figure>` + `<blockquote>` + `<figcaption>` rather than plain
 * divs: that is what ties each quote to its attribution semantically, so a
 * screen reader announces who said what instead of reading a floating sentence.
 */
import { getTestimonials } from '../../api/content.api.js';
import { SECTION_HEADINGS } from '../../content/site.js';
import { useApi } from '../../hooks/useApi.js';
import { useReveal } from '../../hooks/useReveal.js';
import type { Testimonial } from '../../types/api.js';
import { ErrorState } from '../ui/ErrorState.js';
import { SectionHeader } from '../ui/SectionHeader.js';
import { SkeletonGrid } from '../ui/Skeleton.js';

export function Testimonials() {
  const {
    data: testimonials,
    loading,
    error,
    retry
  } = useApi<Testimonial[]>((signal) => getTestimonials(signal));

  return (
    <section className="section section--alt" id="testimonios" aria-labelledby="testimonios-title">
      <div className="container">
        <SectionHeader
          eyebrow={SECTION_HEADINGS.testimonials.eyebrow}
          title={SECTION_HEADINGS.testimonials.title}
          titleId="testimonios-title"
        />

        {loading && !testimonials ? <SkeletonGrid className="quotes" count={3} height={260} /> : null}

        {error ? <ErrorState message={error} onRetry={retry} /> : null}

        {testimonials ? (
          <div className="quotes">
            {testimonials.map((testimonial) => (
              <Quote key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** One testimonial. */
function Quote({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="quote" data-reveal ref={useReveal<HTMLElement>()}>
      <blockquote className="quote__text">
        <p>{testimonial.quote}</p>
      </blockquote>
      <figcaption className="quote__author">
        {/* Initials stand in for a photo; the name is right beside them. */}
        <span className="quote__avatar" aria-hidden="true">
          {testimonial.initials}
        </span>
        <span className="quote__meta">
          <strong className="quote__name">{testimonial.author}</strong>
          <span className="quote__role">
            {testimonial.role}, {testimonial.company}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
