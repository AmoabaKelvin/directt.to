import { eq } from "drizzle-orm";
import crypto from "node:crypto";

import { webhookHasMeta } from "@/lib/typeguards/lemonsqueezy";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

import type {
  LemonsqueezySubscriptionAttributes,
  LemonsqueezyWebhookPayload,
} from "@/lib/types/lemonsqueezy";

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!WEBHOOK_SECRET) {
    return new Response("Lemon Squeezy Webhook Secret not set in .env", { status: 500 });
  }

  try {
    const rawBody = await request.text();
    const signature = request.headers.get("X-Signature");

    if (!signature || !verifySignature(rawBody, signature, WEBHOOK_SECRET)) {
      return new Response("Invalid signature", { status: 401 });
    }

    const data = JSON.parse(rawBody) as LemonsqueezyWebhookPayload;

    if (!webhookHasMeta(data)) {
      return new Response("Webhook does not have meta", { status: 400 });
    }

    await processWebhook(data);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(payload).digest("hex"), "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");
  return crypto.timingSafeEqual(digest, signatureBuffer);
}

async function processWebhook(webhookEvent: LemonsqueezyWebhookPayload) {
  const { meta, data } = webhookEvent;
  const { event_name, custom_data } = meta;
  const { user_id: userId } = custom_data;
  const subscription = data.attributes as LemonsqueezySubscriptionAttributes;

  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, userId),
  });

  if (!user) {
    console.error(`User with id ${userId} not found`);
    return;
  }

  switch (event_name) {
    case "subscription_created":
      await updateSubscriptionCreated(userId, subscription, data.id);
      break;
    // case "subscription_updated":
    //   await updateSubscriptionPeriod(userId, subscription.ends_at!);
    //   break;
    case "subscription_expired":
      await expireSubscription(userId);
      break;
    case "order_created":
      // handle order created
      break;
    default:
      console.log(`Unhandled event: ${event_name}`);
  }
}

async function updateSubscriptionCreated(
  userId: string,
  subscription: LemonsqueezySubscriptionAttributes,
  subscriptionId: string,
) {
  await db
    .update(users)
    .set({
      lemonSqueezySubscriptionId: subscriptionId,
      lemonSqueezyCurrentPeriodEnd: new Date(subscription.renews_at),
      lemonSqueezyCustomerId: String(subscription.customer_id),
    })
    .where(eq(users.id, userId));
}

async function updateSubscriptionPeriod(userId: string, endsAt: string) {
  await db
    .update(users)
    .set({ lemonSqueezyCurrentPeriodEnd: new Date(endsAt) })
    .where(eq(users.id, userId));
}

async function expireSubscription(userId: string) {
  await db
    .update(users)
    .set({ lemonSqueezyCurrentPeriodEnd: new Date() })
    .where(eq(users.id, userId));
}
