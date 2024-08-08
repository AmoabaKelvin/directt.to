import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { projects } from "@/server/db/schema";

import { PROJECT_DOMAIN } from "../constants";

export async function getAppleAppSiteAssociationConfig(domain: string) {
  const whereClause = domain.includes(PROJECT_DOMAIN)
    ? eq(projects.subdomain, domain.split(".")[0]!)
    : eq(projects.customDomain, domain);

  const project = await db.query.projects.findFirst({
    where: whereClause,
    with: {
      iosApp: true,
    },
  });

  if (!project) {
    return null;
  }

  return {
    applinks: {
      apps: [],
      details: [
        {
          appId: `${project.iosApp.teamId}.${project.iosApp.bundleId}`,
          paths: ["*"],
        },
      ],
    },
  };
}
