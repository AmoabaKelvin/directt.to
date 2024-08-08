import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as inputs from "./app.input";
import * as services from "./app.service";

const appRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return services.getAppsWithoutProjects(ctx);
  }),

  createAndroid: protectedProcedure.input(inputs.createAndroidApp).mutation(({ ctx, input }) => {
    return services.createAndroidApp(ctx, input);
  }),

  createIos: protectedProcedure.input(inputs.createIosApp).mutation(({ ctx, input }) => {
    return services.createIosApp(ctx, input);
  }),

  delete: protectedProcedure.input(inputs.deleteAppInput).mutation(({ ctx, input }) => {
    return services.deleteApp(ctx, input);
  }),

  patch: protectedProcedure.input(inputs.updateAppInput).mutation(({ ctx, input }) => {
    return services.updateApp(ctx, input);
  }),
});

export { appRouter as projectAppsRouter };
