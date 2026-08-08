/**
 * LAYER: Entry point
 * Responsibility: start the HTTP server and shut it down cleanly. Nothing else.
 *
 * This is the `index.js` at the left of the architecture diagram: every request
 * enters here and is routed to a controller, which calls a service, which calls
 * a repository. No business logic ever lives in this file.
 */
import { createApp } from './app.js';
import { env } from './config/env.js';
import { activeTransportName } from './services/email.service.js';
import { logger } from './shared/logger.js';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`Vertex Studio API listening on http://localhost:${env.port}`);
  logger.info(`Environment: ${env.nodeEnv} · Email transport: ${activeTransportName()}`);
  logger.info('Data source: JSON files in server/src/data');
});

/**
 * Stops accepting connections and exits once in-flight requests finish.
 *
 * Without this, a container restart would kill the process mid-write — and the
 * one thing this server writes is `leads.json`.
 */
function shutdown(signal: string): void {
  logger.info(`${signal} received — shutting down.`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
