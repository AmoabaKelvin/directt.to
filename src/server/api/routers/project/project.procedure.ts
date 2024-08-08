import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as inputs from "./project.input";
import * as services from "./project.service";

export const projectRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return services.getUserProjects(ctx);
  }),

  create: protectedProcedure.input(inputs.createProjectSchema).mutation(async ({ ctx, input }) => {
    return services.createProject(ctx, input);
  }),

  update: protectedProcedure.input(inputs.updateProjectSchema).mutation(async ({ ctx, input }) => {
    return services.updateProject(ctx, input);
  }),

  delete: protectedProcedure.input(inputs.deleteProjectSchema).mutation(async ({ ctx, input }) => {
    return services.deleteProject(ctx, input);
  }),
});
