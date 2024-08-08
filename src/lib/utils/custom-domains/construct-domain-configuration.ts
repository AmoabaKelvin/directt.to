import type {
  Challenge,
  VercelConfigResponse,
  VercelDomainResponse,
} from "@/lib/types/custom-domains";

export function constructDomainConfiguration(
  domainInfo: VercelDomainResponse,
  domainConfig: VercelConfigResponse,
): { type: "TXT" | "A" | "CNAME"; domain: string; value: string }[] {
  const challenges: Challenge[] = [];
  const isApexDomain = isApex(domainInfo.name);

  addVerificationChallenge(challenges, domainConfig);
  addDnsChallenge(challenges, isApexDomain, domainInfo.name);

  return challenges;
}

function isApex(domain: string): boolean {
  return domain.split(".").length === 2;
}

function addVerificationChallenge(
  challenges: Challenge[],
  domainConfig: VercelConfigResponse,
): void {
  const verificationRecord = getVerificationRecord(domainConfig);
  if (verificationRecord) {
    challenges.push({
      type: "TXT",
      domain: "_vercel",
      value: verificationRecord,
    });
  }
}

function getVerificationRecord(domainConfig: VercelConfigResponse): string | null {
  if (domainConfig.misconfigured) return null;
  return domainConfig.challenges?.find((challenge) => challenge.type === "TXT")?.value ?? null;
}

function addDnsChallenge(challenges: Challenge[], isApexDomain: boolean, domainName: string) {
  if (isApexDomain) {
    challenges.push({
      type: "A",
      domain: "@",
      value: "76.76.21.21",
    });
  } else {
    const subdomain = domainName.split(".")[0];

    challenges.push({
      type: "CNAME",
      domain: subdomain!,
      value: "cname.vercel-dns.com",
    });
  }
}
