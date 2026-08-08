/**
 * LAYER: Services (business logic)
 * Responsibility: resolve the content of the "Testimonios" section.
 * Must not know about: Express (req/res) or the filesystem.
 * Talks only to: repositories.testimonials
 */
import type { Testimonial } from '../domain/entities.js';
import { repositories } from '../repositories/index.js';

/**
 * Returns every published client testimonial.
 *
 * @returns Testimonials in display order.
 */
export async function listTestimonials(): Promise<Testimonial[]> {
  return repositories.testimonials.findAll();
}
