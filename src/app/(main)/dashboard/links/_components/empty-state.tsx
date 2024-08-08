import { Rabbit } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-4 p-4">
      <Rabbit height={400} width={400} />
      <h1 className="text-2xl font-bold">No links found</h1>
      <p className="text-sm text-muted-foreground">
        You have not created any links yet. Create one now!
      </p>
    </div>
  );
};

export default EmptyState;
