import type { Metadata } from "next";
import * as React from "react";

import { env } from "@/env";

import { Billing } from "./_components/billing";
import { BillingSkeleton } from "./_components/billing-skeleton";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Billing",
  description: "Manage your billing and subscription",
};

export default async function BillingPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your billing and subscription</p>
      </div>
      <React.Suspense fallback={<BillingSkeleton />}>
        <Billing />
      </React.Suspense>
    </div>
  );
}
