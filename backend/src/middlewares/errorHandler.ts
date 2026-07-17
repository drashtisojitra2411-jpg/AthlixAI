import type { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { ApiError } from "../utils/ApiError";

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

interface MongoDuplicateKeyError extends Error {
  code: number;
}

const isDuplicateKeyError = (err: Error): err is MongoDuplicateKeyError =>
  "code" in err && (err as MongoDuplicateKeyError).code === 11000;

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Always log server-side, in every environment — an error that isn't an
  // ApiError falls through to the generic response below, which no longer
  // includes err.message, so this is the only remaining record of it.
  console.error(err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors.length > 0 ? { errors: err.errors } : {}),
    });
    return;
  }

  if (err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  if (isDuplicateKeyError(err)) {
    res.status(409).json({
      success: false,
      message: "Duplicate field value entered",
    });
    return;
  }

  // Never forward an unrecognized error's raw message to the client — it
  // can contain internal implementation details (driver/library internals,
  // file paths, connection info). It's already logged above for debugging.
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
