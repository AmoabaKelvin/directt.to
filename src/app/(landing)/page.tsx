import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { AreaChart, Flame, Signature } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ApiIcon, BoltIcon } from "./_components/feature-icons";
import CardSpotlight from "./_components/hover-card";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dynamic Links",
  description: "Hassle free dynamic links to cover all your needs",
};

const features = [
  {
    name: "Super Fast",
    description: "Focus on redirection, we handle the rest",
    logo: BoltIcon,
  },
  {
    name: "Simple API",
    description: "Super simple and fast API to integrate with your app",
    logo: ApiIcon,
  },
  {
    name: "Custom Domains",
    description: "Make your links look unique with your own domain",
    logo: Signature,
  },
  {
    name: "Social Media Previews",
    description: "Customize how people see your shared links",
    logo: Flame,
  },
  {
    name: "Analytics",
    description: "Track your links and see how they are performing",
    logo: AreaChart,
  },
  {
    name: "Open Source",
    description: "We are open source, making iteration fast and easy",
    logo: GitHubLogoIcon,
  },
];

const HomePage = () => {
  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-300px)] max-w-5xl flex-col  items-center justify-center gap-4 py-10 text-center  md:py-12">
        <div className="p-4">
          <div className="mb-10 flex items-center justify-center gap-3">
            <Image src="/logo/logo.png" alt="Logo" width={100} height={100} />
          </div>
          <h1 className="text-balance bg-gradient-to-tr  from-black/70 via-black to-black/60 bg-clip-text text-center text-3xl font-bold text-transparent dark:from-zinc-400/10 dark:via-white/90 dark:to-white/20  sm:text-5xl md:text-6xl lg:text-7xl">
            Open-Source Dynamic Links
          </h1>
          <p className="mb-10 mt-4 text-balance text-center text-muted-foreground md:text-lg lg:text-xl">
            Google shutting down Dynamic Links, no worries, we've got you covered.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/sign-in">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
      <section>
        <div className="container mx-auto lg:max-w-screen-lg">
          <h1 className="mb-4 text-center text-3xl font-bold md:text-4xl lg:text-5xl">
            <a id="features"></a> Features
          </h1>
          <p className="mb-10 text-balance text-center text-muted-foreground md:text-lg lg:text-xl">
            Seamlessly connect users across devices with smart, customizable links that never break.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature, i) => (
              <CardSpotlight
                key={i}
                name={feature.name}
                description={feature.description}
                logo={<feature.logo className="h-12 w-12" />}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
