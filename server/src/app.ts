/**
 * LAYER: Application setup
 * Responsibility: assemble the Express app — middlewares, API router, static
 * files and error handling — and hand it back ready to listen.
 *
 * It is deliberately separate from index.ts: this module builds the app but
 * never binds a port, which keeps it importable from a test or a serverless
 * wrapper without starting a server as a side effect.
 */
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { apiRouter } from './routes/index.js';
import { logger } from './shared/logger.js';

/** Built client bundle. Resolves to the same folder from `src/` and from `dist/`. */
const CLIENT_DIST = resolve(dirname(fileURLToPath(import.meta.url)), '../../client/dist');

/**
 * Builds the configured Express application.
 *
 * @returns The app, with every middleware and route already mounted.
 */
export function createApp(): Express {
  const app = express();

  // Express sits behind a proxy in most deployments; without this, req.ip would
  // be the proxy's address and the contact rate limit would treat every visitor
  // as the same client.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Google Fonts: the stylesheet comes from googleapis, the font files
          // from gstatic. Both are needed for Inter/Sora to load.
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"]
        }
      },
      // The site links out to wa.me; the default same-origin policy would strip
      // the referrer entirely, which is fine, but this keeps the origin only.
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      // Vite's dev server and the API run on different ports in development.
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  app.use(compression());

  // In development the client is served by Vite on another port, so it is a
  // cross-origin caller. In production both are served from here and CORS is
  // irrelevant, but leaving it configured costs nothing and keeps parity.
  app.use(cors({ origin: env.clientOrigin }));

  // The contact form is the only body we accept; a small cap is enough and
  // keeps oversized payloads from ever reaching validation.
  app.use(express.json({ limit: '32kb' }));

  app.use('/api', apiRouter);

  // Unmatched /api/* URLs must fail as JSON, not fall through to the SPA.
  app.use('/api', notFoundHandler);

  mountClient(app);

  app.use(errorHandler);

  return app;
}

/**
 * Serves the built React app, when there is one.
 *
 * In development this is skipped: `client/dist` does not exist yet and Vite is
 * serving the app with hot reload on its own port.
 */
function mountClient(app: Express): void {
  if (!existsSync(CLIENT_DIST)) {
    logger.info('No client build found — serving the API only (run the Vite dev server for the UI).');
    return;
  }

  app.use(express.static(CLIENT_DIST));

  // SPA fallback: any non-API GET returns index.html. The landing page is a
  // single document navigated by anchors, so this only matters for deep links
  // and refreshes, but it keeps the production server from 404-ing on them.
  app.get('*', (_req, res) => {
    res.sendFile(join(CLIENT_DIST, 'index.html'));
  });

  logger.info(`Serving the client build from ${CLIENT_DIST}`);
}
