/**
 * LAYER: Middlewares
 * Responsibility: run a zod schema against the request body before the
 * controller sees it, and replace the body with the parsed result.
 *
 * Doing this as a middleware — instead of inside each controller — is what keeps
 * controllers free of validation code and guarantees that `req.body` is already
 * trimmed, typed and normalised by the time business logic runs.
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

import { ApiError, type FieldErrors } from '../shared/api-error.js';

/**
 * Turns a zod error into a flat `{ field: message }` map.
 *
 * Only the first message per field is kept: the form shows one error under each
 * input, so sending the rest would be noise the UI has to discard anyway.
 */
function toFieldErrors(error: ZodError): FieldErrors {
  const fields: FieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== 'string' || field in fields) continue;
    fields[field] = issue.message;
  }

  return fields;
}

/**
 * Builds a middleware that validates `req.body` with the given schema.
 *
 * @param schema - Zod schema describing the expected payload.
 * @returns An Express middleware. On failure it forwards a 400 `ApiError`
 *          carrying per-field messages; on success it overwrites `req.body`
 *          with the parsed value.
 */
export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(ApiError.badRequest('Revisá los datos del formulario.', toFieldErrors(result.error)));
      return;
    }

    req.body = result.data;
    next();
  };
}
