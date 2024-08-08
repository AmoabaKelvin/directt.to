import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as inputs from "./link.input";
import * as services from "./link.service";

export const linkRouter = createTRPCRouter({
  list: protectedProcedure.input(inputs.listLinksSchema).query(async ({ ctx, input }) => {
    return services.getUserLinks(ctx, input);
  }),
  create: protectedProcedure.input(inputs.createLinkSchema).mutation(async ({ ctx, input }) => {
    return services.createLink(ctx, input);
  }),
  update: protectedProcedure.input(inputs.updateLinkSchema).mutation(async ({ ctx, input }) => {
    return services.updateLink(ctx, input);
  }),
  delete: protectedProcedure.input(inputs.deleteLinkSchema).mutation(async ({ ctx, input }) => {
    return services.deleteLink(ctx, input);
  }),
});
