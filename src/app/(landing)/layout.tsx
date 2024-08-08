import type { Metadata } from "next";
import type { ReactNode } from "react";

import { APP_TITLE } from "@/lib/constants";

import { Footer } from "./_components/footer";
import { Header } from "./_components/header";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "Dynamic links for your applications",
  icons: [{ rel: "icon", url: "/icon.png" }],
};

function LandingPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <div className="h-20"></div>
      <Footer />
    </>
  );
}

export default LandingPageLayout;
