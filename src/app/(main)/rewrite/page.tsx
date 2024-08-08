import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { socialMediaAgents } from "@/lib/constants";
import { parseIncomingDomain } from "@/lib/utils/parse-incoming-domain";
import {
  incrementLinkClicks,
  redirectIncomingRequest,
} from "@/lib/utils/redirect-incoming-request";
import { db } from "@/server/db";
import { links } from "@/server/db/schema";

import type { Metadata } from "next";

type SearchParams = {
  redirectTo: string;
  domain: string;
};

type Props = {
  searchParams: SearchParams;
};

async function getLinkMetadata(domain: string, shortUrl: string) {
  const parsedDomain = parseIncomingDomain(domain);
  return await db.query.links.findFirst({
    where: and(eq(links.shortUrl, shortUrl), eq(links.domain, parsedDomain!)),
  });
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const link = await getLinkMetadata(searchParams.domain, searchParams.redirectTo);

  const info = {
    title: link?.metaTitle ?? "",
    description: link?.metaDescription ?? "",
    image: link?.metaImage ?? "",
  };

  return {
    title: { absolute: info.title },
    description: info.description,
    openGraph: { images: [info.image] },
    twitter: {
      card: "summary_large_image",
      site: info.title,
      title: info.title,
      description: info.description,
      images: [info.image],
    },
  };
}

function isSocialMediaAgent(userAgent: string | null): boolean {
  return socialMediaAgents.some((agent) => userAgent?.includes(agent));
}

const RewritePage = async ({ searchParams }: Props) => {
  const { domain, redirectTo } = searchParams;
  const userAgent = headers().get("user-agent");

  const linkQueryResponse = await redirectIncomingRequest(domain, redirectTo, userAgent!);

  if (!linkQueryResponse) {
    return notFound();
  }

  const { redirectUrl, linkId, userAgentGroup } = linkQueryResponse;

  if (isSocialMediaAgent(userAgent)) {
    return <div>Redirecting...</div>;
  }

  void incrementLinkClicks(linkId, userAgentGroup);
  redirect(redirectUrl);
};

export default RewritePage;
