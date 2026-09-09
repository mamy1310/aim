import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 10;

export const emailSchema = z.string().trim().toLowerCase().email();

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .refine((value) => /[a-zA-Z]/.test(value) && /\d/.test(value), {
    message: 'password_needs_letter_and_digit',
  });

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().length(32),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: emailSchema,
});

export const changePasswordSchema = z.object({
  current: z.string().min(1),
  next: passwordSchema,
});
