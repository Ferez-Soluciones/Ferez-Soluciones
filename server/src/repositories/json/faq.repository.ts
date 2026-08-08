/**
 * LAYER: Repositories (JSON adapter)
 * Responsibility: read the accordion entries from `data/faqs.json`.
 * Must not know about: HTTP or business rules.
 */
import type { Faq } from '../../domain/entities.js';
import type { FaqRepository } from '../contracts.js';
import { byOrder } from '../../shared/sort.js';
import { readCollection } from '../json-store.js';

const FILE = 'faqs.json';

export const jsonFaqRepository: FaqRepository = {
  /** Returns every FAQ, sorted for display. */
  async findAll(): Promise<Faq[]> {
    const faqs = await readCollection<Faq>(FILE);
    return [...faqs].sort(byOrder);
  }
};
