import { z } from "zod";

// 1. Base login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// 2. Register schema (extends login so we don't repeat email/password)
export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters long"),
});

// 3. Export the TypeScript types automatically generated from the Zod schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;