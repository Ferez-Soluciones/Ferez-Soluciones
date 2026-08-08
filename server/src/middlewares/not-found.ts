/**
 * LAYER: Middlewares
 * Responsibility: turn an unmatched API route into a proper 404 error.
 *
 * Without this, Express would answer its default HTML error page — which breaks
 * the client, since `http.ts` always expects the JSON envelope.
 */
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../shared/api-error.js';

/** Catch-all for requests that reached the API router without matching a route. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`No existe el recurso ${req.method} ${req.originalUrl}`));
}
