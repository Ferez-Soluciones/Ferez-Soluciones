/**
 * LAYER: Repositories (JSON adapter)
 * Responsibility: read the client quotes from `data/testimonials.json`.
 * Must not know about: HTTP or business rules.
 */
import type { Testimonial } from '../../domain/entities.js';
import type { TestimonialRepository } from '../contracts.js';
import { byOrder } from '../../shared/sort.js';
import { readCollection } from '../json-store.js';

const FILE = 'testimonials.json';

export const jsonTestimonialRepository: TestimonialRepository = {
  /** Returns every testimonial, sorted for display. */
  async findAll(): Promise<Testimonial[]> {
    const testimonials = await readCollection<Testimonial>(FILE);
    return [...testimonials].sort(byOrder);
  }
};
