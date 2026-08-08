/**
 * LAYER: Repositories (JSON adapter)
 * Responsibility: read the animated counters from `data/stats.json`.
 * Must not know about: HTTP or business rules.
 */
import statsData from '../../data/stats.json' with { type: 'json' };

import type { Stat } from '../../domain/entities.js';
import type { StatRepository } from '../contracts.js';
import { byOrder } from '../../shared/sort.js';

const stats = statsData as unknown as Stat[];

export const jsonStatRepository: StatRepository = {
  /** Returns every metric, sorted for display. */
  async findAll(): Promise<Stat[]> {
    return [...stats].sort(byOrder);
  }
};
