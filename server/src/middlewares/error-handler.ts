/**
 * LAYER: Middlewares
 * Responsibility: the single place where an error becomes an HTTP response.
 *
 * Because every controller is wrapped in `asyncHandler`, all failures — expected
 * (`ApiError`) and unexpected — converge here. That is what lets services throw
 * without importing Express, and what guarantees the client always receives the
 * same error envelope no matter where the failure came from.
 */
import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env.js';
import { ApiError, type FieldErrors } from '../shared/api-error.js';
import { logger } from '../shared/logger.js';

/** Envelope every failing endpoint returns. */
interface ErrorBody {
  success: false;
  error: {
    message: string;
    code: string;
    fields?: FieldErrors;
  };
}

/**
 * Express error handler. Must keep the four-argument signature — that is how
 * Express recognises it as an error middleware.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ApiError) {
    const body: ErrorBody = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(error.fields ? { fields: error.fields } : {})
      }
    };

    res.status(error.statusCode).json(body);
    return;
  }

  // Anything reaching this point is a bug, not a rejected request: log it in
  // full, but never leak the stack trace to the client in production.
  logger.error('Unhandled error while processing a request.', error);

  const body: ErrorBody = {
    success: false,
    error: {
      message: env.isProduction
        ? 'Ocurrió un error inesperado. Probá de nuevo en unos minutos.'
        : error instanceof Error
          ? error.message
          : String(error),
      code: 'INTERNAL_ERROR'
    }
  };

  res.status(500).json(body);
}
