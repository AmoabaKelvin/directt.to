import { eq } from "drizzle-orm";

import { generateId } from "@/lib/utils/generate-id";
import { androidApps, iosApps } from "@/server/db/schema";

import type { CreateAndroidApp, CreateIosApp, DeleteAppInput, UpdateAppInput } from "./app.input";

import type { ProtectedTRPCContext } from "../../trpc";

import type { AndroidApp, IOSApp } from "@/server/db/schema";

export const getUserApps = async (ctx: ProtectedTRPCContext) => {
  const rows = await ctx.db
    .select()
    .from(iosApps)
    .fullJoin(androidApps, eq(iosApps.userId, androidApps.userId));

  const results: {
    android: AndroidApp[];
    ios: IOSApp[];
  } = {
    android: [],
    ios: [],
  };

  for (const row of rows) {
    if (row.android_apps) {
      results.android.push(row.android_apps);
    }

    if (row.ios_apps) {
      results.ios.push(row.ios_apps);
    }
  }

  return results;
};

export const getAppsWithoutProjects = async (ctx: ProtectedTRPCContext) => {
  const androidAppsWithoutProjects = await ctx.db
    .select()
    .from(androidApps)
    .where(eq(androidApps.userId, ctx.auth.userId));

  const iosAppsWithoutProjects = await ctx.db
    .select()
    .from(iosApps)
    .where(eq(iosApps.userId, ctx.auth.userId));

  const results = {
    android: [...androidAppsWithoutProjects.map((app) => ({ ...app, type: "android" }))],
    ios: [...iosAppsWithoutProjects.map((app) => ({ ...app, type: "ios" }))],
  };

  return results;
};

export const createAndroidApp = async (ctx: ProtectedTRPCContext, input: CreateAndroidApp) => {
  const createdApp = await ctx.db
    .insert(androidApps)
    .values({
      id: generateId(15),
      userId: ctx.auth.userId,
      packageName: input.packageName,
      sha256CertFingerprints: JSON.stringify(input.androidSHA256CertFingerprints),
      storeLink: input.storeLink,
    })
    .returning({ id: androidApps.id });

  return {
    success: true,
    id: createdApp[0]!.id,
  };
};

export const createIosApp = async (ctx: ProtectedTRPCContext, input: CreateIosApp) => {
  const createdApp = await ctx.db
    .insert(iosApps)
    .values({
      id: generateId(15),
      userId: ctx.auth.userId,
      bundleId: input.bundleId,
      teamId: input.teamId,
      storeLink: input.storeLink,
    })
    .returning({ id: iosApps.id });

  return {
    success: true,
    id: createdApp[0]!.id,
  };
};

export const updateApp = async (ctx: ProtectedTRPCContext, input: UpdateAppInput) => {
  if (input.android) {
    return ctx.db
      .update(androidApps)
      .set({
        packageName: input.android.packageName,
        sha256CertFingerprints: JSON.stringify(input.android.androidSHA256CertFingerprints),
        storeLink: input.android.storeLink,
      })
      .where(eq(androidApps.id, input.id))
      .returning({ id: androidApps.id });
  } else if (input.ios) {
    return ctx.db
      .update(iosApps)
      .set(input.ios)
      .where(eq(iosApps.id, input.id))
      .returning({ id: iosApps.id });
  }
  throw new Error("Invalid input");
};

export const deleteApp = async (ctx: ProtectedTRPCContext, input: DeleteAppInput) => {
  if (input.kind === "android") {
    const androidResult = await ctx.db
      .delete(androidApps)
      .where(eq(androidApps.id, input.id))
      .returning({ id: androidApps.id });

    if (androidResult.length > 0) {
      return androidResult;
    }
  } else if (input.kind === "ios") {
    const iosResult = await ctx.db
      .delete(iosApps)
      .where(eq(iosApps.id, input.id))
      .returning({ id: iosApps.id });

    if (iosResult.length > 0) {
      return iosResult;
    }
  }

  throw new Error("App not found");
};
