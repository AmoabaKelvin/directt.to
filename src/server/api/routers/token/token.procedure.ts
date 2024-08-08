import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as inputs from "./token.input";
import * as services from "./token.service";

export const tokenRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return services.getUserTokens(ctx);
  }),

  create: protectedProcedure.input(inputs.createTokenSchema).mutation(async ({ ctx, input }) => {
    return services.createToken(ctx, input);
  }),

  delete: protectedProcedure.input(inputs.deleteTokenSchema).mutation(async ({ ctx, input }) => {
    return services.deleteToken(ctx, input);
  }),
});
