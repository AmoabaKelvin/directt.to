import type { VercelDomainResponse, VercelErrorResponse } from "@/lib/types/custom-domains";

export async function addDomainToProject(domain: string) {
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.PROJECT_ID_VERCEL}/domains?teamId=${process.env.TEAM_ID_VERCEL}`,
    {
      body: `{\n  "name": "${domain}"\n}`,
      headers: {
        Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  const data = (await response.json()) as VercelDomainResponse | VercelErrorResponse;

  if ("error" in data) {
    switch (data.error.code) {
      case "forbidden":
        throw new Error("You don't have permission to add a domain to this project");
      case "domain_taken":
        throw new Error("This domain is already taken");
      default:
        throw new Error("Failed to add domain to project");
    }
  }

  return {
    ...data,
    verificationChallenges:
      data.verification?.map((challenge) => ({
        type: challenge.type,
        domain: challenge.domain,
        value: challenge.value,
      })) ?? [],
  };
}
