/**
 * LAYER: Controllers (HTTP)
 * Responsibility: expose the FAQ entries over HTTP.
 * Must not know about: repositories or business rules.
 * Talks only to: faq.service
 */
import { asyncHandler } from '../shared/async-handler.js';
import { sendSuccess } from '../shared/api-response.js';
import { listFaqs } from '../services/faq.service.js';

/** GET /api/faqs — every frequently asked question. */
export const getFaqs = asyncHandler(async (_req, res) => {
  const faqs = await listFaqs();
  sendSuccess(res, faqs);
});
