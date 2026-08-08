/**
 * Section: Servicios
 * Responsibility: the six service cards.
 * Data: GET /api/services
 *
 * The icon arrives as a string key (`service.icon`) which the <Icon> component
 * resolves into an inline SVG. Sending markup from the API instead would mean
 * injecting HTML into the page — this keeps the content data and the rendering
 * decision on the client, where it belongs.
 */
import { getServices } from '../../api/content.api.js';
import { SECTION_HEADINGS } from '../../content/site.js';
import { useApi } from '../../hooks/useApi.js';
import { useReveal } from '../../hooks/useReveal.js';
import type { Service } from '../../types/api.js';
import { ErrorState } from '../ui/ErrorState.js';
import { Icon } from '../ui/Icon.js';
import { SectionHeader } from '../ui/SectionHeader.js';
import { SkeletonGrid } from '../ui/Skeleton.js';

export function Services() {
  const { data: services, loading, error, retry } = useApi<Service[]>((signal) => getServices(signal));

  return (
    <section className="section" id="servicios" aria-labelledby="servicios-title">
      <div className="container">
        <SectionHeader
          eyebrow={SECTION_HEADINGS.services.eyebrow}
          title={SECTION_HEADINGS.services.title}
          lead={SECTION_HEADINGS.services.lead}
          titleId="servicios-title"
        />

        {loading && !services ? <SkeletonGrid className="cards" count={6} /> : null}

        {error ? <ErrorState message={error} onRetry={retry} /> : null}

        {services ? (
          <div className="cards">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** One service card. */
function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="card" data-reveal ref={useReveal<HTMLElement>()}>
      <span className="card__icon" aria-hidden="true">
        <Icon name={service.icon} />
      </span>
      <h3 className="card__title">{service.title}</h3>
      <p className="card__text">{service.description}</p>
    </article>
  );
}
