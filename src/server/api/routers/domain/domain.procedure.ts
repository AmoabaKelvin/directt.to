import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as inputs from "./domain.input";
import * as services from "./domain.service";

export const customDomainRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return services.getUserCustomDomains(ctx);
  }),

  create: protectedProcedure
    .input(inputs.createCustomDomainSchema)
    .mutation(async ({ ctx, input }) => {
      return services.createCustomDomain(ctx, input);
    }),

  delete: protectedProcedure
    .input(inputs.deleteCustomDomainSchema)
    .mutation(async ({ ctx, input }) => {
      return services.deleteCustomDomain(ctx, input);
    }),

  checkStatus: protectedProcedure
    .input(inputs.statusCheckSchema)
    .mutation(async ({ ctx, input }) => {
      return services.checkStatus(ctx, input);
    }),
});
