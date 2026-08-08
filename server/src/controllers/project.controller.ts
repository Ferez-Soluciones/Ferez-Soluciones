/**
 * LAYER: Controllers (HTTP)
 * Responsibility: read the `category` query parameter and hand it to the service.
 * Must not know about: repositories or what "all" means — deciding that is the
 * service's job (see ALL_CATEGORIES in project.service.ts).
 * Talks only to: project.service
 */
import { asyncHandler } from '../shared/async-handler.js';
import { sendSuccess } from '../shared/api-response.js';
import { listProjectCategories, listProjects } from '../services/project.service.js';

/**
 * GET /api/projects?category=<slug>
 *
 * The parameter is optional. Anything that is not a single string (an array from
 * a repeated `?category=` query, for instance) is treated as absent rather than
 * rejected — the portfolio grid should degrade to "show everything", never fail.
 */
export const getProjects = asyncHandler(async (req, res) => {
  const raw = req.query['category'];
  const category = typeof raw === 'string' ? raw : undefined;

  const projects = await listProjects(category);
  sendSuccess(res, projects);
});

/** GET /api/projects/categories — the filter buttons of the portfolio. */
export const getProjectCategories = asyncHandler(async (_req, res) => {
  const categories = await listProjectCategories();
  sendSuccess(res, categories);
});
