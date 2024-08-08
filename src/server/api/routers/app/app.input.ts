import { z } from "zod";

export const createAndroidApp = z.object({
  packageName: z.string(),
  androidSHA256CertFingerprints: z.array(z.string()),
  storeLink: z.string(),
});

export const createIosApp = z.object({
  bundleId: z.string(),
  teamId: z.string(),
  storeLink: z.string(),
});

// New schemas for updating apps
export const updateAndroidApp = z.object({
  packageName: z.string().optional(),
  androidSHA256CertFingerprints: z.array(z.string()).optional(),
  storeLink: z.string().optional(),
});

export const updateIosApp = z.object({
  bundleId: z.string().optional(),
  teamId: z.string().optional(),
  storeLink: z.string().optional(),
});

export const updateAppInput = z
  .object({
    id: z.string(),
    android: updateAndroidApp.optional(),
    ios: updateIosApp.optional(),
  })
  .refine((data) => data.android ?? data.ios, {
    message: "Either Android or iOS app data must be provided",
  });

export const deleteAppInput = z.object({
  id: z.string(),
  kind: z.enum(["android", "ios"]),
});

// Types
export type CreateAndroidApp = z.infer<typeof createAndroidApp>;
export type CreateIosApp = z.infer<typeof createIosApp>;
export type UpdateAndroidApp = z.infer<typeof updateAndroidApp>;
export type UpdateIosApp = z.infer<typeof updateIosApp>;
export type UpdateAppInput = z.infer<typeof updateAppInput>;
export type DeleteAppInput = z.infer<typeof deleteAppInput>;
export const createApp = z.union([createAndroidApp, createIosApp]);
export const updateApp = z.union([updateAndroidApp, updateIosApp]);
