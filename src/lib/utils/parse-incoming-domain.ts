import { PROJECT_DOMAIN } from "../constants";

export function parseIncomingDomain(host: string | null) {
  let domain: string | null = null;

  // if we are in development, just return the host
  // if (process.env.NODE_ENV === "development") {
  //   return constructSubdomain(host?.split(".")[0]);
  // }

  if (host && host.includes(PROJECT_DOMAIN)) {
    const candidate = host.split(".")[0];
    if (candidate && !candidate.includes("www")) {
      domain = constructSubdomain(candidate);
    }
  } else {
    // this is a custom domain
    domain = host;
  }

  return domain;
}

function constructSubdomain(subdomain: string | null | undefined) {
  if (!subdomain) {
    return null;
  }

  return `${subdomain}.${PROJECT_DOMAIN}`;
}
