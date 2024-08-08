import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as paymentService from "./payment.service";

export const paymentRouter = createTRPCRouter({
  createCheckoutUrl: protectedProcedure.mutation(async ({ ctx }) => {
    return paymentService.createCheckoutUrl(ctx);
  }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    return paymentService.cancelUserSubscription(ctx);
  }),

  subscriptionDetails: protectedProcedure.mutation(async ({ ctx }) => {
    return paymentService.getUserSubscriptionDetails(ctx);
  }),

  getPlan: protectedProcedure.query(async ({ ctx }) => {
    return paymentService.getPlan(ctx);
  }),
});
