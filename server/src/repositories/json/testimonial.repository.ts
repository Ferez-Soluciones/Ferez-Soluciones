/**
 * LAYER: Repositories (JSON adapter)
 * Responsibility: read the client quotes from `data/testimonials.json`.
 * Must not know about: HTTP or business rules.
 */
import testimonialsData from '../../data/testimonials.json' with { type: 'json' };

import type { Testimonial } from '../../domain/entities.js';
import type { TestimonialRepository } from '../contracts.js';
import { byOrder } from '../../shared/sort.js';

const testimonials = testimonialsData as unknown as Testimonial[];

export const jsonTestimonialRepository: TestimonialRepository = {
  /** Returns every testimonial, sorted for display. */
  async findAll(): Promise<Testimonial[]> {
    return [...testimonials].sort(byOrder);
  }
};
