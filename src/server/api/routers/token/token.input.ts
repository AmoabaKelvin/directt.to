import { z } from "zod";

export const createTokenSchema = z.object({
  name: z.string().min(1, "Token name is required"),
});

export const deleteTokenSchema = z.object({
  id: z.string(),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type DeleteTokenInput = z.infer<typeof deleteTokenSchema>;
