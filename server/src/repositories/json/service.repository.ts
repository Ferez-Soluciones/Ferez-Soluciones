/**
 * LAYER: Repositories (JSON adapter)
 * Responsibility: read the service cards from `data/services.json`.
 * Must not know about: HTTP or business rules. It fetches records, nothing else.
 *
 * The file is imported rather than read with `fs`. Content is immutable at
 * runtime, so importing it lets the bundler inline the data — which is what
 * makes this work unchanged on a serverless platform, where a path resolved from
 * `import.meta.url` no longer points anywhere real after bundling.
 */
import servicesData from '../../data/services.json' with { type: 'json' };

import type { Service } from '../../domain/entities.js';
import type { ServiceRepository } from '../contracts.js';
import { byOrder } from '../../shared/sort.js';

/**
 * TypeScript widens JSON string literals to `string`, so the assertion is what
 * reconciles the imported shape with the entity's stricter unions. The file sits
 * beside the entity definition, which is what keeps the two in step.
 */
const services = servicesData as unknown as Service[];

export const jsonServiceRepository: ServiceRepository = {
  /** Returns every service card, sorted for display. */
  async findAll(): Promise<Service[]> {
    return [...services].sort(byOrder);
  }
};
