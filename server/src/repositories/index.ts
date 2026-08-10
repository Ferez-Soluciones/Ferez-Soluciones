/**
 * LAYER: Repositories (composition root)
 * Responsibility: pick the concrete adapters and expose them behind the
 * contracts, so no service ever imports an implementation directly.
 *
 * Swapping the persistence of any collection means writing a new adapter and
 * re-pointing one line here — services, controllers and routes stay untouched,
 * which is the whole promise of the layered design.
 *
 * It already earns that: the lead repository is chosen at RUNTIME, because the
 * same code has to run both on a machine with a disk and on a serverless
 * platform without one.
 *
 * One caveat, so the comment does not overpromise: the content adapters resolve
 * their data through a module `import` inside each file, so moving content to a
 * database means editing those five adapters, not just this factory. Only the
 * wiring lives here.
 */
import { env } from '../config/env.js';
import { logger } from '../shared/logger.js';
import type { LeadRepository, Repositories } from './contracts.js';
import { ephemeralLeadRepository } from './ephemeral/lead.repository.js';
import { jsonFaqRepository } from './json/faq.repository.js';
import { jsonLeadRepository } from './json/lead.repository.js';
import { jsonProjectRepository } from './json/project.repository.js';
import { jsonServiceRepository } from './json/service.repository.js';
import { jsonStatRepository } from './json/stat.repository.js';
import { jsonTestimonialRepository } from './json/testimonial.repository.js';

/**
 * Chooses where contact submissions go.
 *
 * The content repositories need no such branch: their data is bundled and
 * read-only, so it works identically everywhere. Only writing is affected by the
 * host, which is exactly why this is the one decision made at runtime.
 */
function resolveLeadRepository(): LeadRepository {
  if (env.isServerless) {
    logger.warn(
      'Serverless runtime detected — leads are not written to disk. The notification email is their only delivery path.'
    );
    return ephemeralLeadRepository;
  }

  return jsonLeadRepository;
}

export const repositories: Repositories = {
  services: jsonServiceRepository,
  projects: jsonProjectRepository,
  testimonials: jsonTestimonialRepository,
  faqs: jsonFaqRepository,
  stats: jsonStatRepository,
  leads: resolveLeadRepository()
};

export type { Repositories } from './contracts.js';
