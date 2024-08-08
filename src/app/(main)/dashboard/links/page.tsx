import type { Metadata } from "next";

import { env } from "@/env";
import { api } from "@/trpc/server";

import { CreateLinkTrigger } from "./_components/create-link-form";
import EmptyState from "./_components/empty-state";
import LinkCard from "./_components/link-card";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Links",
  description: "View and manage your links",
};

export default async function LinksPage() {
  const links = await api.link.list.query({});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Links</h1>
        <p className="text-sm text-muted-foreground">Manage your shortened links here</p>
      </div>
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Links</h2>
        <CreateLinkTrigger />
      </div>
      {links.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {links.map((link) => (
            <LinkCard key={link.linkId} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}
