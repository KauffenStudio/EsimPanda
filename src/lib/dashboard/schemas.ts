import { z } from 'zod/v4';

export const topUpCreateIntentSchema = z.object({
  iccid: z.string().min(1),
  package_id: z.string().min(1),
  email: z.string().email(),
});

export const usageRefreshSchema = z.object({
  iccid: z.string().min(1),
});
