import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { addDomainToProject } from "@/lib/utils/custom-domains/add-domain-to-project";
import { checkConfigurationStatus } from "@/lib/utils/custom-domains/check-configuration-status";
import { cleanUrl } from "@/lib/utils/custom-domains/clean-url";
import { constructDomainConfiguration } from "@/lib/utils/custom-domains/construct-domain-configuration";
import { fetchDomainInfo } from "@/lib/utils/custom-domains/fetch-domain-info";
import { getDomainConfigInfo } from "@/lib/utils/custom-domains/get-domain-config-info";
import { deleteDomainFromVercelProject } from "@/lib/utils/custom-domains/remove-domain-from-project";
import { generateId } from "@/lib/utils/generate-id";
import { isUserPro } from "@/lib/utils/payments/check-subscription-status";
import { customDomains } from "@/server/db/schema";

import type { ProtectedTRPCContext } from "../../trpc";

import type {
  CreateCustomDomainInput,
  DeleteCustomDomainInput,
  StatusCheckInput,
} from "./domain.input";
export const getUserCustomDomains = async (ctx: ProtectedTRPCContext) => {
  const result = await ctx.db
    .select()
    .from(customDomains)
    .where(eq(customDomains.userId, ctx.auth.userId));

  return result;
};

export const createCustomDomain = async (
  ctx: ProtectedTRPCContext,
  input: CreateCustomDomainInput,
) => {
  const user = await ctx.db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, ctx.auth.userId),
  });

  if (!user || !isUserPro(user)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You need to be a Pro user to create a custom domain",
    });
  }

  const existingDomain = await ctx.db.query.customDomains.findFirst({
    where: eq(customDomains.domain, input.domain),
  });

  if (existingDomain) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "This domain is already registered",
    });
  }

  const cleanedDomain = cleanUrl(input.domain);

  try {
    const addDomainResponse = await addDomainToProject(cleanedDomain);
    const challenges = addDomainResponse.verificationChallenges;

    const verificationDetails = challenges
      .filter((challenge) => challenge.type === "TXT")
      .map((challenge) => ({
        type: challenge.type,
        domain: "_vercel",
        value: challenge.value,
      }));

    const [isDomainMisconfigured, domainConfiguration] = await Promise.all([
      checkConfigurationStatus(cleanedDomain),
      getDomainConfigInfo(cleanedDomain),
    ]);

    let verificationDetailsToUse = verificationDetails;

    if (domainConfiguration.misconfigured) {
      const domainInfo = await fetchDomainInfo(cleanedDomain);
      verificationDetailsToUse = constructDomainConfiguration(domainInfo, domainConfiguration);
    }

    const [createdDomain] = await ctx.db
      .insert(customDomains)
      .values({
        id: generateId(15),
        userId: ctx.auth.userId,
        domain: input.domain,
        challenges: JSON.stringify(verificationDetailsToUse),
        verified: !isDomainMisconfigured,
      })
      .returning({ id: customDomains.id });

    return {
      success: true,
      id: createdDomain!.id,
    };
  } catch (error) {
    console.error("Failed to add domain to project:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to add domain to project",
    });
  }
};

export const deleteCustomDomain = async (
  ctx: ProtectedTRPCContext,
  input: DeleteCustomDomainInput,
) => {
  const deletedDomain = await ctx.db
    .delete(customDomains)
    .where(eq(customDomains.id, input.id))
    .returning({ domain: customDomains.domain });

  if (deletedDomain.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Custom domain not found",
    });
  }

  await deleteDomainFromVercelProject(deletedDomain[0]!.domain);

  return {
    success: true,
  };
};

export const checkStatus = async (ctx: ProtectedTRPCContext, input: StatusCheckInput) => {
  const cleanedDomain = cleanUrl(input.domain);

  const [domainConfiguration, domainInfo] = await Promise.all([
    getDomainConfigInfo(cleanedDomain),
    fetchDomainInfo(cleanedDomain),
  ]);

  if (domainConfiguration.misconfigured && domainInfo.verified) {
    const challenges = constructDomainConfiguration(domainInfo, domainConfiguration);
    let status: "pending" | "verified" | "invalid" = "pending";

    if (domainInfo.verified) {
      status = domainConfiguration.misconfigured ? "invalid" : "verified";

      await ctx.db
        .update(customDomains)
        .set({ challenges: JSON.stringify(challenges), verified: status === "verified" })
        .where(
          and(eq(customDomains.domain, input.domain), eq(customDomains.userId, ctx.auth.userId)),
        );
    }

    return {
      status,
      challenges,
    };
  }

  // if domain is configured and verified, we need to update the domain in the database to be verified
  if (!domainConfiguration.misconfigured) {
    await ctx.db
      .update(customDomains)
      .set({ verified: true })
      .where(
        and(eq(customDomains.domain, input.domain), eq(customDomains.userId, ctx.auth.userId)),
      );

    return {
      status: "verified",
      challenges: [],
    };
  }

  return {
    status: "pending",
    challenges: [],
  };
};
