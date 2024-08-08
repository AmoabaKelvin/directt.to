import type { User } from "@/server/db/schema";

export function isUserPro(user: User): boolean {
  if (!user.lemonSqueezySubscriptionId) {
    return false;
  }

  const currentTime = new Date().getTime();
  const subscriptionEndTime = user.lemonSqueezyCurrentPeriodEnd?.getTime();

  if (!subscriptionEndTime || currentTime > subscriptionEndTime) {
    return false;
  }

  return true;
}
