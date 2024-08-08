import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { api } from "@/trpc/server";

import LinkCard from "./links/_components/link-card";
import ProjectCard from "./projects/_components/project-card";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Posts",
  description: "Manage your posts here",
};

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function DashboardPage({ searchParams }: Props) {
  // const promises = Promise.all([api.stripe.getPlan.query()]);

  const projects = await api.project.list.query();
  const links = await api.link.list.query({});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Overview</h1>
        <p className="text-sm text-muted-foreground">View your projects and links at a glance</p>
      </div>
      <div className="mt-10 flex items-center justify-between">
        <h1 className="text-xl">Projects</h1>
        <Button asChild>
          <Link href="/dashboard/projects">View Projects</Link>
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, idx) => (
          <ProjectCard key={`${project.id}-${idx}`} project={project} />
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h1 className="text-xl">Links</h1>
        <Button>View Links</Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <LinkCard key={link.linkId} link={link} />
        ))}
      </div>
    </div>
  );
}
