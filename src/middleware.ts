import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { PROJECT_DOMAINS } from "./lib/constants";
import { getValidSubdomain } from "./lib/utils/get-valid-subdomain";
import { getAssetLinksConfig } from "./lib/utils/retrieve-android-assetlinks";
import { getAppleAppSiteAssociationConfig } from "./lib/utils/retrieve-apple-site-association";

import type { NextRequest } from "next/server";
async function getAssetLinksMiddleware(req: NextRequest) {
  const host = req.headers.get("host");
  const isProjectDomain = PROJECT_DOMAINS.includes(host!) || "localhost:3000";
  const domain = isProjectDomain ? host : getValidSubdomain(req.headers.get("host"));

  if (!domain || !isProjectDomain) {
    return new Response(null, { status: 404 });
  }

  if (req.nextUrl.pathname === "/apple-app-site-association") {
    return new Response(JSON.stringify(await getAppleAppSiteAssociationConfig(domain)), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (req.nextUrl.pathname === "/.well-known/assetlinks.json") {
    return new Response(JSON.stringify(await getAssetLinksConfig(domain)), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // MARK: Link Redirections
  if (
    req.nextUrl.pathname.length > 1 &&
    !req.nextUrl.pathname.startsWith("/dashboard") &&
    !req.nextUrl.pathname.startsWith("/sign-in") &&
    !req.nextUrl.pathname.startsWith("/sign-up") &&
    !req.nextUrl.pathname.startsWith("/api/trpc") &&
    !req.nextUrl.pathname.startsWith("/api/v1") &&
    !req.nextUrl.pathname.startsWith("/api/webhooks") &&
    !req.nextUrl.pathname.startsWith("/icon") &&
    req.nextUrl.pathname !== "/"
  ) {
    return NextResponse.rewrite(
      new URL(
        `/rewrite?redirectTo=${req.nextUrl.pathname.split("/")[1]}&domain=${domain}`,
        req.url,
      ),
    );
  }
}

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();

  return getAssetLinksMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
