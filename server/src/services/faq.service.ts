/**
 * LAYER: Services (business logic)
 * Responsibility: resolve the content of the FAQ accordion.
 * Must not know about: Express (req/res) or the filesystem.
 * Talks only to: repositories.faqs
 */
import type { Faq } from '../domain/entities.js';
import { repositories } from '../repositories/index.js';

/**
 * Returns every frequently asked question.
 *
 * @returns FAQs in display order.
 */
export async function listFaqs(): Promise<Faq[]> {
  return repositories.faqs.findAll();
}
