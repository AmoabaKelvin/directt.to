import type { Metadata } from "next";

import { env } from "@/env";
import { api } from "@/trpc/server";

import CustomDomainCard from "./_components/custom-domain-card";
import { CreateCustomDomainTrigger } from "./_components/custom-domain-form";
import EmptyState from "./_components/empty-state";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Custom Domains",
  description: "Manage your custom domains",
};

export default async function BillingPage() {
  const customDomains = await api.customDomain.list.query();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Custom Domains</h1>
        <p className="text-sm text-muted-foreground">Manage your custom domains here</p>
      </div>
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Custom Domains</h2>
        <CreateCustomDomainTrigger />
      </div>
      {customDomains.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {customDomains.map((domain) => (
            <CustomDomainCard key={domain.id} domain={domain} />
          ))}
        </div>
      )}
    </div>
  );
}
