import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  avatar: z.string().trim().url("Avatar must be a valid URL").optional(),
  // Self-registration may only mint Organizer or Visitor accounts — never
  // Admin. Omitted entirely, this still falls through to the User model's
  // own default("Organizer"), unchanged from before this field existed.
  role: z.enum(["Organizer", "Visitor"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
