"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import type { ManageSubscriptionInput } from "@/server/api/routers/stripe/stripe.input";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function ManageSubscriptionForm({
  isPro,
  stripeCustomerId,
  stripeSubscriptionId,
  stripePriceId,
}: ManageSubscriptionInput) {
  const [isPending, startTransition] = React.useTransition();
  const managePlanMutation = api.stripe.managePlan.useMutation();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const session = await managePlanMutation.mutateAsync({
          isPro,
          stripeCustomerId,
          stripeSubscriptionId,
          stripePriceId,
        });

        if (session) {
          window.location.href = session.url ?? "/dashboard/billing";
        }
      } catch (err) {
        err instanceof Error
          ? toast.error(err.message)
          : toast.error("An error occurred. Please try again.");
      }
    });
  }

  return (
    <form className="w-full" onSubmit={onSubmit}>
      <Button className="w-full" disabled={isPending}>
        {isPending ? "Loading..." : isPro ? "Manage plan" : "Subscribe now"}
      </Button>
    </form>
  );
}
