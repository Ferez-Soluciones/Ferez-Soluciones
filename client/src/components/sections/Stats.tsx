/**
 * Section: Métricas
 * Responsibility: the four animated counters under the hero.
 * Data: GET /api/stats
 *
 * Each counter owns its own useCountUp hook, which is why the item is a separate
 * component — hooks cannot be called inside a map callback.
 *
 * While loading, the band renders nothing rather than a skeleton: it is a thin
 * strip of four numbers, and a shimmering placeholder there reads as breakage.
 * If the request fails the whole section is dropped, since a landing page is
 * better off without its metrics than showing an error where they should be.
 */
import { getStats } from '../../api/content.api.js';
import { useApi } from '../../hooks/useApi.js';
import { useCountUp } from '../../hooks/useCountUp.js';
import { useReveal } from '../../hooks/useReveal.js';
import type { Stat } from '../../types/api.js';

export function Stats() {
  const { data: stats, error } = useApi<Stat[]>((signal) => getStats(signal));

  if (error || !stats || stats.length === 0) return null;

  return (
    <section className="stats" aria-label="Nuestros números">
      <div className="container stats__grid">
        {stats.map((stat) => (
          <StatItem key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
}

/** One metric, counting up the first time it scrolls into view. */
function StatItem({ stat }: { stat: Stat }) {
  const { ref, display } = useCountUp<HTMLElement>(stat.value, stat.suffix);

  return (
    <article className="stat" data-reveal ref={useReveal<HTMLElement>()}>
      <strong className="stat__value" ref={ref}>
        {display}
      </strong>
      <p className="stat__label">{stat.label}</p>
    </article>
  );
}
