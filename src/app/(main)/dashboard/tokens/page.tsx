import { api } from "@/trpc/server";

import { CreateTokenTrigger } from "./_components/create-token-form";
import EmptyState from "./_components/empty-state";
import TokenCard from "./_components/token-card";

export default async function APITokensPage() {
  const tokens = await api.token.list.query();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">API Tokens</h1>
        <p className="text-sm text-muted-foreground">Manage your API tokens here</p>
      </div>
      <div className="mt-10 flex justify-between">
        <h2 className="text-2xl font-semibold">Your API Tokens</h2>
        <CreateTokenTrigger />
      </div>
      {tokens.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {tokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}
