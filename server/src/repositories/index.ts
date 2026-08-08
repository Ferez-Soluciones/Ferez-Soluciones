/**
 * LAYER: Repositories (composition root)
 * Responsibility: pick the concrete adapters and expose them behind the
 * contracts, so no service ever imports an implementation directly.
 *
 * Today there is exactly one adapter (JSON files), which makes this file look
 * almost redundant. It is not: it is the single place to edit when the data
 * source changes. Swapping in SQLite or Postgres means writing the new adapter
 * and re-pointing these six lines — services, controllers and routes stay
 * untouched, which is the whole promise of the layered design.
 */
import type { Repositories } from './contracts.js';
import { jsonFaqRepository } from './json/faq.repository.js';
import { jsonLeadRepository } from './json/lead.repository.js';
import { jsonProjectRepository } from './json/project.repository.js';
import { jsonServiceRepository } from './json/service.repository.js';
import { jsonStatRepository } from './json/stat.repository.js';
import { jsonTestimonialRepository } from './json/testimonial.repository.js';

export const repositories: Repositories = {
  services: jsonServiceRepository,
  projects: jsonProjectRepository,
  testimonials: jsonTestimonialRepository,
  faqs: jsonFaqRepository,
  stats: jsonStatRepository,
  leads: jsonLeadRepository
};

export type { Repositories } from './contracts.js';
