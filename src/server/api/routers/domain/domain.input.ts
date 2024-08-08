import { z } from "zod";

export const createCustomDomainSchema = z.object({
  domain: z.string().regex(/^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/, {
    message: "Please enter a valid domain",
  }),
});

export const deleteCustomDomainSchema = z.object({
  id: z.string(),
});

export const statusCheckSchema = z.object({
  domain: z.string(),
});

export type CreateCustomDomainInput = z.infer<typeof createCustomDomainSchema>;
export type DeleteCustomDomainInput = z.infer<typeof deleteCustomDomainSchema>;
export type StatusCheckInput = z.infer<typeof statusCheckSchema>;
