import { z } from "../lib/zod-extended";

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(100)
      .openapi({ example: "budi123" }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .openapi({ example: "Password123" }),
  })
  .openapi("RegisterInput");

export const loginSchema = z
  .object({
    username: z
      .string()
      .trim()
      .nonempty("Username is required")
      .openapi({ example: "budi123" }),
    password: z
      .string()
      .nonempty("Password is required")
      .openapi({ example: "Password123" }),
  })
  .openapi("LoginInput");

export const updateUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "...")
      .max(100, "...")
      .optional()
      .openapi({ example: "budi123" }),
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .optional()
      .openapi({ example: "budi@mail.com" }),
    avatarUrl: z.string().trim().url("Invalid URL").optional(),
    fullName: z
      .string()
      .trim()
      .max(100, "...")
      .optional()
      .openapi({ example: "Budi Santoso" }),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  .openapi("UpdateUserInput");

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .nonempty("Current password is required")
      .openapi({ example: "Password123" }),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
      .regex(/[0-9]/, "New password must contain at least one number")
      .nonempty("New password is required")
      .openapi({ example: "Password12345" }),
    confirmPassword: z
      .string()
      .nonempty("Confirm password is required")
      .openapi({ example: "Password12345" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password must match",
    path: ["confirmPassword"],
  })
  .openapi("ChangePasswordInput");

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
