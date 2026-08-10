/**
 * LAYER: Middlewares
 * Responsibility: cap how many times the same client can hit a write endpoint.
 *
 * `POST /api/contact` is public and does real work — a disk write, an outbound
 * email — so it needs a brake. A dedicated library would bring Redis-backed
 * stores and distributed counters this project has no use for.
 *
 * Know what this does and does not buy you: the counter lives in one process's
 * memory. On a long-running server that is a genuine per-IP hourly limit. On a
 * serverless host it is not — every cold start begins with an empty map and
 * instances are created freely, so it degrades to "a brake on bursts within a
 * single warm instance". That is still worth having against a naive script, and
 * it is not a security control on either host.
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { ApiError } from '../shared/api-error.js';

interface Bucket {
  count: number;
  /** Epoch millis at which this bucket is discarded. */
  expiresAt: number;
}

export interface RateLimitOptions {
  /** Maximum requests allowed per client inside the window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Message returned to the blocked client. */
  message: string;
}

/**
 * Creates a fixed-window rate limiting middleware.
 *
 * @param options - Limit, window length and rejection message.
 * @returns An Express middleware that forwards a 429 `ApiError` once exceeded.
 */
export function rateLimit(options: RateLimitOptions): RequestHandler {
  const buckets = new Map<string, Bucket>();

  /** Drops expired buckets so the map cannot grow unbounded over time. */
  function evictExpired(now: number): void {
    for (const [key, bucket] of buckets) {
      if (bucket.expiresAt <= now) buckets.delete(key);
    }
  }

  return (req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    evictExpired(now);

    const key = req.ip ?? 'unknown';
    const bucket = buckets.get(key);

    if (!bucket) {
      buckets.set(key, { count: 1, expiresAt: now + options.windowMs });
      next();
      return;
    }

    if (bucket.count >= options.max) {
      next(ApiError.tooManyRequests(options.message));
      return;
    }

    bucket.count += 1;
    next();
  };
}
