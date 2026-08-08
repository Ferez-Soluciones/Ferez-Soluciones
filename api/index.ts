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
import { createApp } from '../server/src/app.js';

export default createApp();
