import type { VercelConfigResponse } from "@/lib/types/custom-domains";

export async function getDomainConfigInfo(domain: string) {
  const response = await fetch(
    `https://api.vercel.com/v6/domains/${domain}/config?teamId=${process.env.TEAM_ID_VERCEL}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.json() as Promise<VercelConfigResponse>;
}
