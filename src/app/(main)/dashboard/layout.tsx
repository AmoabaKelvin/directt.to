import { DashboardNav } from "./_components/dashboard-nav";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="container min-h-[calc(100vh-180px)] px-2 pt-6 md:px-4">
      <div className="flex flex-col gap-6 md:flex-row lg:gap-10">
        <DashboardNav className="no-scrollbar flex flex-shrink-0 gap-2 overflow-x-auto md:w-48 md:flex-col lg:w-80" />
        <main className="w-full space-y-4">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
