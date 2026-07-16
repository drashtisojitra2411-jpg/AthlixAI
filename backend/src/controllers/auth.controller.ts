import type { Request, Response } from "express";
import { User } from "../models/User.model";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { generateToken } from "../utils/jwt";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password, avatar } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ fullName, email, password, avatar });

  const token = generateToken({ id: user.id, role: user.role });

  sendSuccess(res, 201, "User registered successfully", { user, token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken({ id: user.id, role: user.role });

  sendSuccess(res, 200, "Login successful", { user, token });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, "Current user fetched successfully", {
    user: req.user,
  });
});
