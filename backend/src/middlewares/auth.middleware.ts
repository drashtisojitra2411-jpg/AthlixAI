import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyToken } from "../utils/jwt";

export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Not authorized, no token provided");
    }

    const token = authHeader.split(" ")[1];

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new ApiError(401, "Not authorized, invalid or expired token");
    }

    const user = await User.findById(payload.id);
    if (!user) {
      throw new ApiError(401, "Not authorized, user no longer exists");
    }

    req.user = user;
    next();
  }
);

export const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ApiError(403, "Forbidden: insufficient role permissions"));
      return;
    }
    next();
  };
