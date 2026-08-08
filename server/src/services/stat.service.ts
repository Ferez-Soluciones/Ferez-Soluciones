/**
 * LAYER: Services (business logic)
 * Responsibility: resolve the metrics band shown under the hero.
 * Must not know about: Express (req/res) or the filesystem.
 * Talks only to: repositories.stats
 */
import type { Stat } from '../domain/entities.js';
import { repositories } from '../repositories/index.js';

/**
 * Returns the studio metrics the client animates as counters.
 *
 * @returns Stats in display order.
 */
export async function listStats(): Promise<Stat[]> {
  return repositories.stats.findAll();
}
