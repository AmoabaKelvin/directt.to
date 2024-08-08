import Image from "next/image";
import Link from "next/link";

import { APP_TITLE } from "@/lib/constants";

export const Header = async () => {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 p-0">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-2 py-2 lg:px-4">
        <Link className="flex items-center justify-center text-xl font-medium" href="/">
          <Image src="logoPurple.svg" alt="Logo" width={40} height={40} />
          {APP_TITLE} Dashboard
        </Link>
        {/* place clerk user dropdown here */}
      </div>
    </header>
  );
};
