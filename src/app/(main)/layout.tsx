import { type ReactNode } from "react";

import { Footer } from "./_components/footer";
import { Header } from "./_components/header";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <div className="mx-auto mt-16 max-w-6xl">{children}</div>
      <Footer />
    </>
  );
};

export default MainLayout;
