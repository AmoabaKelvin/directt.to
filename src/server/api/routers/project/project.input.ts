import { z } from "zod";

export const createProjectSchema = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    subdomain: z.string().optional(),
    customDomain: z.string().optional(),
    androidAppId: z.string().optional(),
    iosAppId: z.string().optional(),
  })
  .refine((input) => {
    return input.androidAppId ?? input.iosAppId;
  });

export const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  subdomain: z.string().optional(),
  androidAppId: z.string().optional(),
  iosAppId: z.string().optional(),
});

export const deleteProjectSchema = z.object({
  id: z.string(),
});

export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
