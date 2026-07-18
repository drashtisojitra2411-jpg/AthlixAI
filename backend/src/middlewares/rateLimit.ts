import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

/**
 * Minimal in-memory fixed-window rate limiter (no external dependency, so it
 * carries no install/repo-size risk). Sufficient for a single-instance
 * deployment; a multi-instance deployment would need a shared store instead.
 */
export const rateLimit = ({ windowMs, max, message }: RateLimitOptions) => {
  const hits = new Map<string, WindowEntry>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs).unref();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= max) {
      next(new ApiError(429, message ?? "Too many requests. Please try again later."));
      return;
    }

    entry.count += 1;
    next();
  };
};
