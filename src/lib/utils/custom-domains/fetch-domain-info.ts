import type { VercelDomainResponse } from "@/lib/types/custom-domains";

export async function fetchDomainInfo(domain: string) {
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.PROJECT_ID_VERCEL}/domains/${domain}?teamId=${process.env.TEAM_ID_VERCEL}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.json() as Promise<VercelDomainResponse>;
}
