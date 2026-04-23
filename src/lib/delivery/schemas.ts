import { z } from 'zod';

export const provisionRequestSchema = z.object({
  payment_intent_id: z.string().min(1),
  email: z.string().email().optional(),
});

export const statusRequestSchema = z.object({
  payment_intent: z.string().min(1),
});

export const webhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.string(), z.unknown()),
  }),
});

export type ProvisionRequest = z.infer<typeof provisionRequestSchema>;
export type StatusRequest = z.infer<typeof statusRequestSchema>;
