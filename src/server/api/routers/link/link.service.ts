import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { FREE_LINKS_LIMIT } from "@/lib/constants";
import { fetchMetadataInfo } from "@/lib/utils/fetch-metadata-info";
import { generateId } from "@/lib/utils/generate-id";
import { isUserPro } from "@/lib/utils/payments/check-subscription-status";
import { links, projects } from "@/server/db/schema";

import type { ProtectedTRPCContext } from "../../trpc";
import type {
  CreateLinkInput,
  DeleteLinkInput,
  ListLinksInput,
  UpdateLinkInput,
} from "./link.input";
export const getUserLinks = async (ctx: ProtectedTRPCContext, input: ListLinksInput) => {
  // const isRequestFromDashboardPage =
  //   ctx.headers.get("referer")?.split("/").slice(-1)[0] === "dashboard";

  const result = await ctx.db
    .select({
      linkId: links.id,
      url: links.longUrl,
      shortUrl: links.shortUrl,
      clicks: links.clicks,
      appStoreRedirects: links.appStoreRedirects,
      playstoreRedirects: links.playStoreRedirects,
      projectId: projects.id,
      projectName: projects.name,
      createdAt: links.createdAt,
      metaTitle: links.metaTitle,
      metaDescription: links.metaDescription,
      metaImage: links.metaImage,
    })
    .from(links)
    .innerJoin(projects, eq(links.projectId, projects.id))
    .where(eq(projects.userId, ctx.auth.userId));

  return result;
};

export const createLink = async (ctx: ProtectedTRPCContext, input: CreateLinkInput) => {
  const project = await ctx.db.query.projects.findFirst({
    where: eq(projects.id, input.projectId),
    with: { user: true },
  });

  if (!project) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found",
    });
  }

  const isPro = isUserPro(project.user);

  if (!isPro && project.user.createdLinksCount >= FREE_LINKS_LIMIT) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message:
        "You have reached the limit of free links. Upgrade to the Pro plan to create more links.",
    });
  }

  // if no metadata is provided, fetch the metadata from the long url
  if (!input.metadata.title) {
    const { title, description, image } = await fetchMetadataInfo(input.url);
    input.metadata = { title, description, image };
  }

  const createdLink = await ctx.db
    .insert(links)
    .values({
      id: generateId(21),
      projectId: input.projectId,
      domain: project.customDomain ? project.customDomain : project.subdomain!,
      longUrl: input.url,
      shortUrl: generateId(8),
      metaDescription: input.metadata?.description,
      metaTitle: input.metadata?.title,
      metaImage: input.metadata?.image,
    })
    .returning({ id: links.id });

  return {
    success: true,
    id: createdLink[0]!.id,
  };
};

export const updateLink = async (ctx: ProtectedTRPCContext, input: UpdateLinkInput) => {
  const { id, url, metadata } = input;

  let updatedMetadata = metadata;

  if (url && (!metadata?.title || !metadata?.description || !metadata?.image)) {
    // If URL is updated but no custom metadata is provided, fetch new metadata
    updatedMetadata = await fetchMetadataInfo(url);
  }

  const updatedLink = await ctx.db
    .update(links)
    .set({
      longUrl: url,
      metaTitle: updatedMetadata?.title,
      metaDescription: updatedMetadata?.description,
      metaImage: updatedMetadata?.image,
    })
    .where(eq(links.id, id))
    .returning();

  if (updatedLink.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Link not found",
    });
  }

  return {
    success: true,
    link: updatedLink[0],
  };
};

export const deleteLink = async (ctx: ProtectedTRPCContext, input: DeleteLinkInput) => {
  const { id } = input;

  const deletedLink = await ctx.db.delete(links).where(eq(links.id, id)).returning();

  if (deletedLink.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Link not found",
    });
  }

  return {
    success: true,
  };
};
