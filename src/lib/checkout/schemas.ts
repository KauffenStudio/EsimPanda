import { z } from 'zod/v4';

export const checkoutFormSchema = z.object({
  email: z.string().email(),
  plan_id: z.string().min(1),
  coupon_code: z.string().optional(),
});

export const createIntentRequestSchema = z.object({
  plan_id: z.string().min(1),
  email: z.string().email(),
  coupon_code: z.string().optional(),
});

export const createIntentResponseSchema = z.object({
  client_secret: z.string(),
  amount: z.number(),
  tax_amount: z.number(),
  subtotal: z.number(),
  discount: z.number(),
});
