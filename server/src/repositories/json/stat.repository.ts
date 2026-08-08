/**
 * LAYER: Repositories (JSON adapter)
 * Responsibility: read the animated counters from `data/stats.json`.
 * Must not know about: HTTP or business rules.
 */
import type { Stat } from '../../domain/entities.js';
import type { StatRepository } from '../contracts.js';
import { byOrder } from '../../shared/sort.js';
import { readCollection } from '../json-store.js';

const FILE = 'stats.json';

export const jsonStatRepository: StatRepository = {
  /** Returns every metric, sorted for display. */
  async findAll(): Promise<Stat[]> {
    const stats = await readCollection<Stat>(FILE);
    return [...stats].sort(byOrder);
  }
};
