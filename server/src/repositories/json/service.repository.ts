/**
 * LAYER: Repositories (JSON adapter)
 * Responsibility: read the service cards from `data/services.json`.
 * Must not know about: HTTP or business rules. It fetches records, nothing else.
 */
import type { Service } from '../../domain/entities.js';
import type { ServiceRepository } from '../contracts.js';
import { byOrder } from '../../shared/sort.js';
import { readCollection } from '../json-store.js';

const FILE = 'services.json';

export const jsonServiceRepository: ServiceRepository = {
  /** Returns every service card, sorted for display. */
  async findAll(): Promise<Service[]> {
    const services = await readCollection<Service>(FILE);
    return [...services].sort(byOrder);
  }
};
