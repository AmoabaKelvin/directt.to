import { count, eq } from "drizzle-orm";

import { generateId } from "@/lib/utils/generate-id";
import { androidApps, iosApps, links, projects } from "@/server/db/schema";

import type { ProtectedTRPCContext } from "../../trpc";
import type { CreateProjectInput, DeleteProjectInput, UpdateProjectInput } from "./project.input";

export const createProject = async (ctx: ProtectedTRPCContext, input: CreateProjectInput) => {
  if (!input.subdomain && !input.customDomain) {
    throw new Error("Subdomain or custom domain is required");
  }

  const createdProject = await ctx.db
    .insert(projects)
    .values({
      id: generateId(15),
      name: input.name,
      description: input.description,
      subdomain: input.subdomain,
      customDomain: input.customDomain,
      userId: ctx.auth.userId,
    })
    .returning({ id: projects.id });

  if (input.androidAppId) {
    await ctx.db
      .update(androidApps)
      .set({
        projectId: createdProject[0]!.id,
      })
      .where(eq(androidApps.id, input.androidAppId));
  }

  if (input.iosAppId) {
    await ctx.db
      .update(iosApps)
      .set({
        projectId: createdProject[0]!.id,
      })
      .where(eq(iosApps.id, input.iosAppId));
  }

  return {
    success: true,
  };
};

export const getUserProjects = async (ctx: ProtectedTRPCContext) => {
  const result = await ctx.db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      subdomain: projects.subdomain,
      customDomain: projects.customDomain,
      createdAt: projects.createdAt,
      links: count(links.id),
      androidAppId: androidApps.id,
      iosAppId: iosApps.id,
    })
    .from(projects)
    .leftJoin(links, eq(projects.id, links.projectId))
    .leftJoin(androidApps, eq(projects.id, androidApps.projectId))
    .leftJoin(iosApps, eq(projects.id, iosApps.projectId))
    .where(eq(projects.userId, ctx.auth.userId))
    .groupBy(projects.id);

  return result;
};

export const updateProject = async (ctx: ProtectedTRPCContext, input: UpdateProjectInput) => {
  const { id, ...updateData } = input;

  // Update the project
  await ctx.db.update(projects).set(updateData).where(eq(projects.id, id));

  // Update Android app association if changed
  if (updateData.androidAppId !== undefined) {
    await ctx.db
      .update(androidApps)
      .set({ projectId: updateData.androidAppId || null })
      .where(eq(androidApps.projectId, id));
  }

  // Update iOS app association if changed
  if (updateData.iosAppId !== undefined) {
    await ctx.db
      .update(iosApps)
      .set({ projectId: updateData.iosAppId || null })
      .where(eq(iosApps.projectId, id));
  }

  return { success: true };
};

export const deleteProject = async (ctx: ProtectedTRPCContext, input: DeleteProjectInput) => {
  const { id } = input;

  // Start a transaction to ensure all operations are performed atomically
  return await ctx.db.transaction(async (tx) => {
    // Delete associated links
    await tx.delete(links).where(eq(links.projectId, id));

    // Remove project associations from apps
    await tx.update(androidApps).set({ projectId: null }).where(eq(androidApps.projectId, id));
    await tx.update(iosApps).set({ projectId: null }).where(eq(iosApps.projectId, id));

    // Delete the project
    const deletedProject = await tx.delete(projects).where(eq(projects.id, id)).returning();

    if (deletedProject.length === 0) {
      throw new Error("Project not found");
    }

    return { success: true };
  });
};
