import type { VercelConfigResponse } from "@/lib/types/custom-domains";

import { cleanUrl } from "./clean-url";

export async function checkConfigurationStatus(domain: string) {
  const cleanedDomain = cleanUrl(domain);

  const response = await fetch(
    `https://api.vercel.com/v6/domains/${cleanedDomain}/config?teamId=${process.env.TEAM_ID_VERCEL}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = (await response.json()) as VercelConfigResponse;

  return data.misconfigured;
}
