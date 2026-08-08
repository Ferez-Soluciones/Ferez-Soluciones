/**
 * LAYER: Controllers (HTTP)
 * Responsibility: translate an HTTP request into a service call and the result
 * back into a response.
 * Must not know about: repositories, the filesystem or any business rule.
 * Talks only to: service.service
 */
import { asyncHandler } from '../shared/async-handler.js';
import { sendSuccess } from '../shared/api-response.js';
import { listServices } from '../services/service.service.js';

/** GET /api/services — every service card of the studio. */
export const getServices = asyncHandler(async (_req, res) => {
  const services = await listServices();
  sendSuccess(res, services);
});
