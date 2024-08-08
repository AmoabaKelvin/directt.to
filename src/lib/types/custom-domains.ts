export interface VercelDomainResponse {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string | null;
  redirectStatusCode?: number | null;
  gitBranch?: string | null;
  updatedAt?: number;
  createdAt?: number;
  verified: boolean;
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
}

export interface VercelErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export type VercelConfigResponse = {
  configuredBy: string | null;
  nameservers: string[];
  serviceType: string;
  cnames: string[];
  aValues: string[];
  conflicts: unknown[];
  acceptedChallenges: unknown[];
  misconfigured: boolean;
  challenges?: { type: string; value: string }[];
};

export type Challenge = {
  type: "TXT" | "A" | "CNAME";
  domain: string;
  value: string;
};

export type VerificationDetails = {
  // challenges: Challenge[];
  type: "TXT" | "A" | "CNAME";
  domain: string;
  value: string;
}[];
