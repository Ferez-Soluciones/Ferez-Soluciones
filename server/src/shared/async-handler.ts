/**
 * LAYER: Shared utilities
 * Responsibility: forward rejected promises from async controllers to Express.
 *
 * Express 4 does not catch rejections from async handlers: an awaited error would
 * hang the request instead of reaching the error middleware. Wrapping every async
 * controller here means no controller needs its own try/catch, so they stay as
 * thin as the architecture intends.
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async controller so any thrown/rejected error is passed to `next()`.
 *
 * @param handler - The async controller function.
 * @returns An Express-compatible request handler.
 */
export function asyncHandler(handler: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
