/**
 * LAYER: Repositories (JSON adapter)
 * Responsibility: read the accordion entries from `data/faqs.json`.
 * Must not know about: HTTP or business rules.
 */
import faqsData from '../../data/faqs.json' with { type: 'json' };

import type { Faq } from '../../domain/entities.js';
import type { FaqRepository } from '../contracts.js';
import { byOrder } from '../../shared/sort.js';

const faqs = faqsData as unknown as Faq[];

export const jsonFaqRepository: FaqRepository = {
  /** Returns every FAQ, sorted for display. */
  async findAll(): Promise<Faq[]> {
    return [...faqs].sort(byOrder);
  }
};
