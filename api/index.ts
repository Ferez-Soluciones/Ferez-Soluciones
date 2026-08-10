/**
 * LAYER: Entry point (serverless)
 * Responsibility: expose the Express app as a Vercel Function. Nothing else.
 *
 * The counterpart of `server/src/index.ts`: same app, different host. That file
 * binds a port and owns the process; this one hands the app to Vercel, which
 * invokes it per request. Because `createApp()` never listens on a port, both
 * entry points can reuse it untouched — which is the reason app setup and
 * process startup were kept in separate modules.
 *
 * `vercel.json` rewrites every `/api/*` request here, and the app already mounts
 * its router under `/api`, so the paths line up with no translation.
 *
 * An Express app is itself an `(req, res)` handler, which is exactly the shape
 * the Node runtime expects — no adapter needed.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

import { createApp } from '../server/src/app.js';
import { repositories } from '../server/src/repositories/index.js';
import { assertDeliveryPathIsSound } from '../server/src/services/email.service.js';

const app = createApp();

// Runs once per cold start, the serverless counterpart of the boot check in
// server/src/index.ts. Without it a misconfigured deployment rejects every
// submission with no explanation anywhere in the logs.
assertDeliveryPathIsSound(repositories.leads.isDurable);

/**
 * Vercel handler.
 *
 * The path is normalised before Express sees it. Vercel's rewrite sends
 * `/api/*` here, but whether the function receives the original path or the
 * rewritten destination is not something this codebase should bet on: if the
 * prefix were dropped, `apiRouter` (mounted at `/api`) would match nothing and
 * every endpoint would 404 in production while working perfectly in dev.
 *
 * Restoring the prefix when it is missing costs two lines and makes the
 * deployment correct under either behaviour.
 */
export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }

  app(req, res);
}
