/**
 * LAYER: Routes (root router)
 * Responsibility: mount every resource router under the /api prefix — the
 * "index.js" fan-out of the architecture diagram.
 */
import { Router } from 'express';

import { sendSuccess } from '../shared/api-response.js';
import { contactRoutes } from './contact.routes.js';
import { contentRoutes } from './content.routes.js';

export const apiRouter = Router();

/** GET /api/health — liveness probe, answered without touching any layer. */
apiRouter.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() });
});

apiRouter.use(contentRoutes);
apiRouter.use(contactRoutes);
