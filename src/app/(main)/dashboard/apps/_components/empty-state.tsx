import { Worm } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-4 p-4">
      <Worm height={400} width={400} />
      <h1 className="text-2xl font-bold">No apps found</h1>
      <p className="text-sm text-muted-foreground">
        You don't have any apps configured yet. Create one now!
      </p>
    </div>
  );
};

export default EmptyState;
