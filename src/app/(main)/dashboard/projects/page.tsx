import type { Metadata } from "next";

import { env } from "@/env";
import { api } from "@/trpc/server";

import EmptyState from "./_components/empty-state";
import ProjectCard from "./_components/project-card";
import { CreateProjectTrigger } from "./_components/project-form";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Projects",
  description: "Configure, manage and view your projects",
};

export default async function ProjectsPage() {
  const promises = Promise.all([api.app.list.query()]);
  const projects = await api.project.list.query();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Projects</h1>
        <p className="text-sm text-muted-foreground">Manage your projects here</p>
      </div>
      <div className="mt-10 flex justify-between">
        <h1>Projects</h1>
        <CreateProjectTrigger promises={promises} />
      </div>
      {projects.length === 0 && <EmptyState />}
      <div className="mt-4 flex flex-col gap-2">
        {projects.map((project, idx) => (
          <ProjectCard key={`${project.id}-${idx}`} project={project} />
        ))}
      </div>
    </div>
  );
}
