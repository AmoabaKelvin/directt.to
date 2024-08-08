import { z } from "zod";

export const createLinkSchema = z.object({
  projectId: z.string(),
  url: z.string(),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const updateLinkSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  metadata: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    })
    .optional(),
});

export const deleteLinkSchema = z.object({
  id: z.string(),
});

export const listLinksSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  // page: z.number().min(1).default(1),
  // pageSize: z.number().min(1).max(100).default(10),
  // orderBy: z.enum(["createdAt", "totalClicks"]).default("createdAt"),
  // orderDirection: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type DeleteLinkInput = z.infer<typeof deleteLinkSchema>;
export type ListLinksInput = z.infer<typeof listLinksSchema>;
