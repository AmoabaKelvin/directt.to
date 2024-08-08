import { Squirrel } from "lucide-react";
import Link from "next/link";

import { api } from "@/trpc/server";

const EmptyState = async () => {
  const userSubscription = await api.payment.getPlan.query();
  const isPro = userSubscription.isPro;

  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-4 p-4">
      <Squirrel height={400} width={400} />
      <h1 className="text-2xl font-bold">No custom domains found</h1>
      <p className="text-sm text-muted-foreground">
        {isPro ? (
          "You don't have any custom domains configured yet."
        ) : (
          <Link href="/dashboard/billing" className="underline underline-offset-4">
            Upgrade to the Pro plan to add custom domains.
          </Link>
        )}
      </p>
    </div>
  );
};

export default EmptyState;
