import { PawPrint } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-4 p-4">
      <PawPrint height={300} width={300} />
      <h1 className="text-2xl font-bold">No API tokens found</h1>
      <p className="text-sm text-muted-foreground">
        You currently don't have any API tokens configured. Create one now!
      </p>
    </div>
  );
};

export default EmptyState;
