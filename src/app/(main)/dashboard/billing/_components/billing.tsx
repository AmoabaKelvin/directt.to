import Link from "next/link";

import { CheckIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { api } from "@/trpc/server";

import { ManageSubscriptionForm } from "./manage-subscription-form";

interface BillingProps {}

export async function Billing({}: BillingProps) {
  const userPlan = await api.payment.getPlan.query();

  const plans = [
    {
      isPro: true,
      name: "Pro",
      description: "Unlimited links",
      price: "$4.99",
      features: [
        // "Unlimited links",
        // "Custom domains",
        // "Applinks support",
        // "Asset links support",
        // "Link analytics",
        // "Priority support",
        // "Analytics Dashboard (coming soon)",
        "Everything in free plan",
        "Custom domains",
        "Unlimited links",
        "Priority support",
        "Advanced analytics (soon)",
        // "Analytics Dashboard (soon)",
        "Customizable redirect page (soon)",
      ],
    },
    {
      isPro: false,
      name: "Free",
      description: "5000 links",
      price: "$0.00",
      features: [
        "5000 free links",
        "Free subdomains",
        "Applinks support",
        "Asset links support",
        "Link analytics",
        "General support",
      ],
    },
  ];

  const currentPlan = userPlan.isPro ? plans[0] : plans[1];

  return (
    <>
      <section>
        <Card className="space-y-2 p-8">
          <h3 className="text-lg font-semibold sm:text-xl">{currentPlan!.name} plan</h3>
          <p className="text-sm text-muted-foreground">
            {!userPlan.isPro
              ? "The free plan is limited to 5000 links. Upgrade to the Pro plan for unlimited links and more features."
              : userPlan.subscriptionDetails?.renews_at
                ? "Your plan will be renewed on "
                : "Your plan renews on "}
            {userPlan.currentPeriodEnd ? formatDate(new Date(userPlan.currentPeriodEnd)) : null}
            <p>Thank you for supporting us! 💖</p>
          </p>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        {plans.map((item) => (
          <Card key={item.name} className="flex flex-col p-2">
            <CardHeader className="h-full">
              <CardTitle className="line-clamp-1">{item.name}</CardTitle>
              <CardDescription className="line-clamp-2">{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="h-full flex-1 space-y-6">
              <div className="text-3xl font-bold">
                {item.price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <div className="space-y-2">
                {item.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="aspect-square shrink-0 rounded-full bg-foreground p-px text-background">
                      <CheckIcon className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              {item.name === "Free" ? (
                <Button className="w-full" asChild>
                  <Link
                    href="/dashboard"
                    className={cn({
                      "pointer-events-none cursor-not-allowed text-muted-foreground":
                        !userPlan.isPro,
                    })}
                  >
                    {userPlan.isPro ? "Get started" : "Current Plan"}
                    <span className="sr-only">Current Plan</span>
                  </Link>
                </Button>
              ) : (
                <ManageSubscriptionForm
                  isPro={userPlan.isPro}
                  customerId={userPlan.customerId}
                  subscriptionId={userPlan.subscriptionId}
                />
              )}
            </CardFooter>
          </Card>
        ))}
      </section>
    </>
  );
}
