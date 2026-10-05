import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    mobile: z.string().regex(/^\d{10}$/, 'Invalid mobile number'),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
  }),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().email('Invalid email address').optional(),
      mobile: z.string().regex(/^\d{10}$/, 'Invalid mobile number').optional(),
      password: z.string().min(1, 'Password is required'),
    })
    .refine((body) => body.email || body.mobile, {
      message: 'Email or mobile is required',
      path: ['email'],
    }),
});
