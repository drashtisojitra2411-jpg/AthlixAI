import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      next(new ApiError(400, "Validation failed", errors));
      return;
    }

    req.body = result.data;
    next();
  };
