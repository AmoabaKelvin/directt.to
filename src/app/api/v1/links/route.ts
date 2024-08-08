import { waitUntil } from "@vercel/functions";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";

import { FREE_LINKS_LIMIT } from "@/lib/constants";
import { fetchMetadataInfo } from "@/lib/utils/fetch-metadata-info";
import { generateId } from "@/lib/utils/generate-id";
import { isUserPro } from "@/lib/utils/payments/check-subscription-status";
import { hashToken } from "@/lib/utils/tokens/hash-token";
import { db } from "@/server/db";
import { apiTokens, links, projects } from "@/server/db/schema";

import type { APIToken } from "@/server/db/schema";
import type { NextRequest } from "next/server";
const createDynamicLinkSchema = z.object({
  link: z.string().url().min(1),
  projectDomain: z.string().min(1).max(255),
  metaData: z
    .object({
      title: z.string().min(1).max(255).optional(),
      description: z.string().min(1).max(255).optional(),
      image: z.string().min(1).max(255).optional(),
    })
    .optional(),
  androidReferrer: z.string().min(1).optional(),
});

type MetaData = z.infer<typeof createDynamicLinkSchema>["metaData"];

export async function POST(req: Request) {
  const { token, error } = await validateRequest(req);
  if (!token) return Response.json({ error }, { status: 401 });

  const requestBody = (await req.json()) as unknown;

  const validateLinkData = createDynamicLinkSchema.safeParse(requestBody);
  if (!validateLinkData.success) {
    return Response.json({ error: validateLinkData.error.message }, { status: 400 });
  }

  const { link, projectDomain, metaData, androidReferrer } = validateLinkData.data;

  const project = await db.query.projects.findFirst({
    where: and(
      (or(eq(projects.subdomain, projectDomain), eq(projects.customDomain, projectDomain)),
      eq(projects.userId, token.userId)),
    ),
    with: { user: true },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const isPro = isUserPro(project.user);

  if (!isPro && project.user.createdLinksCount >= FREE_LINKS_LIMIT) {
    return Response.json({ error: "You have reached the limit of free links" }, { status: 402 });
  }

  const [createdLink] = await db
    .insert(links)
    .values({
      id: generateId(21),
      projectId: project.id,
      domain: project.customDomain ? project.customDomain : project.subdomain!,
      longUrl: link,
      shortUrl: generateId(8),
      metaDescription: metaData?.description,
      metaTitle: metaData?.title,
      metaImage: metaData?.image,
      androidReferrer: androidReferrer,
    })
    .returning({ id: links.id, shortUrl: links.shortUrl, domain: links.domain });

  waitUntil(fetchMetadataAndUpdateLink(createdLink!.id, link, metaData));

  return Response.json(
    {
      linkId: createdLink?.id,
      url: constructLinkUrl(createdLink!.domain, createdLink!.shortUrl),
    },
    { status: 201 },
  );
}

export async function GET(req: NextRequest) {
  const { token, error } = await validateRequest(req);
  if (!token) return new Response(error, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const domain = searchParams.get("domain");
  const alias = searchParams.get("alias");

  if (!domain || !alias) {
    return new Response("Missing domain or shortUrl", { status: 400 });
  }

  const link = await db.query.links.findFirst({
    columns: { id: true, domain: true, shortUrl: true },
    where: and(eq(links.domain, domain), eq(links.shortUrl, alias)),
  });

  if (!link) {
    return Response.json({ error: "Link not found" }, { status: 404 });
  }

  return Response.json({ url: constructLinkUrl(link.domain, link.shortUrl) });
}

async function fetchMetadataAndUpdateLink(
  linkId: string,
  link: string,
  metaData: MetaData | undefined,
) {
  if (metaData) {
    return;
  }

  const { title, description, image } = await fetchMetadataInfo(link);
  await db
    .update(links)
    .set({ metaDescription: description, metaTitle: title, metaImage: image })
    .where(eq(links.id, linkId));
}

function constructLinkUrl(domain: string, shortUrl: string) {
  return `https://${domain}/${shortUrl}`;
}

type ValidateRequestResponse =
  | {
      error: string;
      token: null;
    }
  | {
      error: null;
      token: APIToken;
    };

async function validateRequest(req: Request): Promise<ValidateRequestResponse> {
  const apiKeyHeader = req.headers.get("x-api-key");

  if (!apiKeyHeader) {
    return { error: "No API key provided", token: null };
  }

  const hashedKey = hashToken(apiKeyHeader);

  const tokenResult = await db.query.apiTokens.findFirst({
    where: eq(apiTokens.token, hashedKey),
  });

  if (!tokenResult) {
    return { error: "Invalid API key", token: null };
  }

  return {
    error: null,
    token: tokenResult,
  };
}
