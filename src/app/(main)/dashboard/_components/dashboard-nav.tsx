"use client";

import { Braces, CableIcon, FolderOpen, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CreditCard, GearIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const items = [
  // {
  //   title: "Dashboard",
  //   href: "/dashboard",
  //   icon: FileTextIcon,
  // },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: FolderOpen,
  },
  {
    title: "Apps",
    href: "/dashboard/apps",
    icon: LayoutGrid,
  },
  {
    title: "Links",
    href: "/dashboard/links",
    icon: CableIcon,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Domains",
    href: "/dashboard/domains",
    icon: GearIcon,
  },
  {
    title: "Tokens",
    href: "/dashboard/tokens",
    icon: Braces,
  },
];

interface Props {
  className?: string;
}

export function DashboardNav({ className }: Props) {
  const path = usePathname();

  return (
    <nav className={cn(className)}>
      {items.map((item) => (
        <Link href={item.href} key={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              path === item.href ? "bg-accent" : "transparent",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
