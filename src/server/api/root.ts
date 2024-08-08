import { projectAppsRouter } from "./routers/app/app.procedure";
import { customDomainRouter } from "./routers/domain/domain.procedure";
import { linkRouter } from "./routers/link/link.procedure";
import { paymentRouter } from "./routers/payment/payment.procedure";
import { projectRouter } from "./routers/project/project.procedure";
import { tokenRouter } from "./routers/token/token.procedure";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  app: projectAppsRouter,
  project: projectRouter,
  link: linkRouter,
  customDomain: customDomainRouter,
  token: tokenRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
