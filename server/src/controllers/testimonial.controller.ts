/**
 * LAYER: Controllers (HTTP)
 * Responsibility: expose the testimonials over HTTP.
 * Must not know about: repositories or business rules.
 * Talks only to: testimonial.service
 */
import { asyncHandler } from '../shared/async-handler.js';
import { sendSuccess } from '../shared/api-response.js';
import { listTestimonials } from '../services/testimonial.service.js';

/** GET /api/testimonials — every published client quote. */
export const getTestimonials = asyncHandler(async (_req, res) => {
  const testimonials = await listTestimonials();
  sendSuccess(res, testimonials);
});
