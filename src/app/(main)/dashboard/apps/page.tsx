import type { Metadata } from "next";

import { env } from "@/env";
import { api } from "@/trpc/server";

import AppCard from "./_components/app-card";
import { CreateAppTrigger } from "./_components/create-app-form";
import EmptyState from "./_components/empty-state";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Apps",
  description: "Manage your connected apps",
};

export default async function AppsPage() {
  const apps = await api.app.list.query();
  const appsList = [...apps.android, ...apps.ios];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Apps</h1>
        <p className="text-sm text-muted-foreground">Manage your app configurations here</p>
      </div>
      <div className="mt-10 flex justify-between">
        <h1>Apps</h1>
        <CreateAppTrigger />
      </div>
      {appsList.length === 0 && <EmptyState />}
      <div className="mt-4 flex flex-col gap-2">
        {appsList.map((app, idx) => (
          <AppCard key={`${app.id}-${idx}`} app={app} type={app.type as "android" | "ios"} />
        ))}
      </div>
    </div>
  );
}
