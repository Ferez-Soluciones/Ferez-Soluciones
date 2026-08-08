/**
 * LAYER: Shared utilities
 * Responsibility: represent an error that the API knows how to turn into an
 * HTTP response, as opposed to an unexpected crash.
 *
 * Services throw `ApiError` to signal "this request is invalid / not found /
 * rate limited" without importing Express. The error handler middleware is the
 * only place that reads `statusCode` and writes the actual response, which keeps
 * the business layer transport-agnostic.
 */

/** Per-field validation messages, keyed by form field name. */
export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  /** Present only on validation errors, so the client can highlight each input. */
  readonly fields: FieldErrors | undefined;

  constructor(statusCode: number, message: string, code: string, fields?: FieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
  }

  /** 400 — the payload did not pass validation. */
  static badRequest(message: string, fields?: FieldErrors): ApiError {
    return new ApiError(400, message, 'BAD_REQUEST', fields);
  }

  /** 404 — the route or resource does not exist. */
  static notFound(message = 'Recurso no encontrado.'): ApiError {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  /** 429 — too many requests from the same client. */
  static tooManyRequests(message: string): ApiError {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS');
  }

  /** 500 — something the server could not handle. */
  static internal(message = 'Ocurrió un error inesperado.'): ApiError {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}
