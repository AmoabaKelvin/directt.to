"use client";

import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export const manageSubscriptionSchema = z.object({
  // stripePriceId: z.string(),
  // stripeCustomerId: z.string().optional().nullable(),
  // stripeSubscriptionId: z.string().optional().nullable(),
  // isPro: z.boolean(),
  isPro: z.boolean(),
  customerId: z.string().optional().nullable(),
  subscriptionId: z.string().optional().nullable(),
});

export type ManageSubscriptionInput = z.infer<typeof manageSubscriptionSchema>;

export function ManageSubscriptionForm({
  isPro,
  customerId,
  subscriptionId,
}: ManageSubscriptionInput) {
  const [isPending, startTransition] = React.useTransition();
  const createCheckoutSessionMutation = api.payment.createCheckoutUrl.useMutation();
  const getSubscriptionDetailsMutation = api.payment.subscriptionDetails.useMutation();
  // const managePlanMutation = api.stripe.managePlan.useMutation();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      if (isPro) {
        try {
          const subscriptionDetails = await getSubscriptionDetailsMutation.mutateAsync();

          if (subscriptionDetails) {
            window.location.href = subscriptionDetails.customer_portal;
            return;
          }
        } catch (err) {
          err instanceof Error
            ? toast.error(err.message)
            : toast.error("An error occurred. Please try again.");
          return;
        }
      }

      try {
        const session = await createCheckoutSessionMutation.mutateAsync();

        if (session) {
          window.location.href = session;
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
