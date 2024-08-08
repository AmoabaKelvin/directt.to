import { cancelSubscription, createCheckout, getSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { eq } from "drizzle-orm";

import { configureLemonSqueezy } from "@/lib/lemonsqueezy";
import { users } from "@/server/db/schema";

import type { ProtectedTRPCContext } from "../../trpc";

configureLemonSqueezy();

export async function createCheckoutUrl(ctx: ProtectedTRPCContext) {
  const variantId = Number(process.env.LEMONSQUEEZY_VARIANT_ID!);
  const user = await ctx.db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, ctx.auth.userId),
  });

  const checkout = await createCheckout(process.env.LEMONSQUEEZY_STORE_ID!, variantId, {
    checkoutOptions: {
      embed: true,
      media: false,
    },
    checkoutData: {
      email: user!.email ?? undefined,
      custom: {
        user_id: ctx.auth.userId,
      },
    },
    productOptions: {
      enabledVariants: [variantId],
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/`,
      receiptButtonText: "Go to Dashboard",
      receiptThankYouNote: "Thank you for signing up to Redirectt Pro!",
    },
  });

  return checkout.data?.data.attributes.url;
}

export async function cancelUserSubscription(ctx: ProtectedTRPCContext) {
  const user = await ctx.db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, ctx.auth.userId),
  });

  if (!user?.lemonSqueezySubscriptionId) {
    throw new Error("No active subscription found");
  }

  const cancelledSub = await cancelSubscription(user.lemonSqueezySubscriptionId);
  if (cancelledSub.error) {
    throw new Error(cancelledSub.error.message);
  }

  await ctx.db
    .update(users)
    .set({
      lemonSqueezyCurrentPeriodEnd: new Date(cancelledSub.data.data.attributes.ends_at!),
    })
    .where(eq(users.id, ctx.auth.userId));

  return cancelledSub;
}

export async function getUserSubscriptionDetails(ctx: ProtectedTRPCContext) {
  const userSubscription = await ctx.db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, ctx.auth.userId),
  });

  if (!userSubscription?.lemonSqueezySubscriptionId) {
    throw new Error("No active subscription found");
  }

  const userSub = await getSubscription(userSubscription.lemonSqueezySubscriptionId);
  if (userSub.error) {
    throw new Error(userSub.error.message);
  }

  return userSub.data.data.attributes.urls;
}

export async function getPlan(ctx: ProtectedTRPCContext) {
  const user = await ctx.db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, ctx.auth.userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isPro = Boolean(
    user.lemonSqueezySubscriptionId &&
      user.lemonSqueezyCurrentPeriodEnd &&
      new Date(user.lemonSqueezyCurrentPeriodEnd) > new Date(),
  );

  let subscriptionDetails = null;
  if (user.lemonSqueezySubscriptionId) {
    try {
      const subResponse = await getSubscription(user.lemonSqueezySubscriptionId);
      if (!subResponse.error) {
        subscriptionDetails = subResponse.data.data.attributes;
      }
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    }
  }

  return {
    isPro,
    subscriptionDetails,
    customerId: user.lemonSqueezyCustomerId,
    subscriptionId: user.lemonSqueezySubscriptionId,
    currentPeriodEnd: user.lemonSqueezyCurrentPeriodEnd,
  };
}
