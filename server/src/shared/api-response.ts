/**
 * LAYER: Shared utilities
 * Responsibility: keep every successful response in the same envelope.
 *
 * The client's `http.ts` unwraps exactly this shape, so having one helper here
 * means a controller can never accidentally ship a bare array and break parsing.
 */
import type { Response } from 'express';

/** Envelope every successful endpoint returns. */
export interface SuccessBody<T> {
  success: true;
  data: T;
}

/**
 * Writes a successful JSON response.
 *
 * @param res - Express response.
 * @param data - Payload to wrap.
 * @param statusCode - HTTP status. Defaults to 200; use 201 after creating.
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const body: SuccessBody<T> = { success: true, data };
  res.status(statusCode).json(body);
}
