/**
 * LAYER: Services (business logic)
 * Responsibility: resolve the content of the "Servicios" section.
 * Must not know about: Express (req/res) or the filesystem.
 * Talks only to: repositories.services
 */
import type { Service } from '../domain/entities.js';
import { repositories } from '../repositories/index.js';

/**
 * Returns every service card offered by the studio.
 *
 * @returns Services in display order.
 */
export async function listServices(): Promise<Service[]> {
  return repositories.services.findAll();
}
