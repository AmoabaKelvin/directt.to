import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { projects } from "@/server/db/schema";

import { PROJECT_DOMAIN } from "../constants";

export async function getAssetLinksConfig(domain: string) {
  const whereClause = domain.includes(PROJECT_DOMAIN)
    ? eq(projects.subdomain, domain.split(".")[0]!)
    : eq(projects.customDomain, domain);

  const project = await db.query.projects.findFirst({
    where: whereClause,
    with: {
      androidApp: true,
    },
  });

  if (!project?.androidApp) {
    return null;
  }

  const sha256CertFingerprints = JSON.parse(project.androidApp.sha256CertFingerprints) as string[];

  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: project.androidApp.packageName,
        sha256_cert_fingerprints: sha256CertFingerprints,
      },
    },
  ];
}
