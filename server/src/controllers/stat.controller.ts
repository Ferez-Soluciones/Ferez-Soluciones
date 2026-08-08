/**
 * LAYER: Controllers (HTTP)
 * Responsibility: expose the studio metrics over HTTP.
 * Must not know about: repositories or business rules.
 * Talks only to: stat.service
 */
import { asyncHandler } from '../shared/async-handler.js';
import { sendSuccess } from '../shared/api-response.js';
import { listStats } from '../services/stat.service.js';

/** GET /api/stats — the animated counters shown under the hero. */
export const getStats = asyncHandler(async (_req, res) => {
  const stats = await listStats();
  sendSuccess(res, stats);
});
