import type { AnyColumn } from "drizzle-orm";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { links } from "@/server/db/schema";

import { PROJECT_DOMAIN } from "../constants";
import { checkUserAgentGroup } from "./check-user-agent-group";

export async function redirectIncomingRequest(domain: string, shortUrl: string, userAgent: string) {
  const parsedDomain = domain.includes(PROJECT_DOMAIN) ? domain.split(".")[0]! : domain;

  const link = await db.query.links.findFirst({
    where: and(eq(links.shortUrl, shortUrl), eq(links.domain, parsedDomain)),
    with: {
      project: {
        with: {
          androidApp: true,
          iosApp: true,
        },
      },
    },
  });

  if (!link) {
    return null;
  }

  const isAndroidUserAgent = /android/i.test(userAgent);
  const isIOSUserAgent = /iphone|ipad|ipod/i.test(userAgent);

  let redirectUrl = link.longUrl;

  if (isAndroidUserAgent && link.project.androidApp) {
    if (link.androidReferrer) {
      redirectUrl = `https://play.google.com/store/apps/details?id=${link.project.androidApp.packageName}&referrer=${link.androidReferrer}`;
    } else {
      redirectUrl = `https://play.google.com/store/apps/details?id=${link.project.androidApp.packageName}`;
    }
  } else if (isIOSUserAgent && link.project.iosApp) {
    redirectUrl = link.project.iosApp.storeLink;
  }

  const userAgentGroup = checkUserAgentGroup(userAgent);

  return { redirectUrl, linkId: link.id, userAgentGroup };
}

export async function incrementLinkClicks(linkId: string, userAgentGroup: string) {
  let setClause = {};

  if (userAgentGroup === "ios") {
    setClause = { appStoreRedirects: increment(links.appStoreRedirects) };
  } else if (userAgentGroup === "android") {
    setClause = { playStoreRedirects: increment(links.playStoreRedirects) };
  } else {
    setClause = { generalRedirects: increment(links.generalRedirects) };
  }

  await db
    .update(links)
    .set({ clicks: increment(links.clicks), ...setClause })
    .where(eq(links.id, linkId));
}

function increment(column: AnyColumn, amount = 1) {
  return sql`${column} + ${amount}`;
}
