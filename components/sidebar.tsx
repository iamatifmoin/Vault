"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  LayoutDashboard,
  Map,
  UserRound,
} from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { cn } from "@/lib/utils";

interface SidebarProps {
  profileHref?: string;
}

const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/library",
    label: "Library",
    icon: BookOpen,
  },
  {
    href: "/companies",
    label: "Companies",
    icon: Building2,
  },
  {
    href: "/study-plan",
    label: "Study Plan",
    icon: Map,
  },
];

export function Sidebar({ profileHref = "/profile" }: SidebarProps) {
  const pathname = usePathname();
  const items = [
    ...navigation,
    {
      href: profileHref,
      label: "My Profile",
      icon: UserRound,
    },
  ];

  return (
    <>
      <nav className="fixed left-0 top-0 z-40 hidden h-screen w-sidebar-width flex-col overflow-hidden border-r border-border bg-vault-bg py-gutter md:flex">
        <div aria-hidden className="vault-brand-bleed" />
        <div className="relative px-container-padding pb-8">
          <AppLogo size="md" />
        </div>

        <div className="relative flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={cn(
                  "flex h-9 items-center gap-3 border-l-2 px-4 text-sm text-muted-foreground transition-colors hover:bg-vault-surface hover:text-foreground",
                  active &&
                    "border-vault-brand bg-gradient-to-r from-vault-brand-muted to-transparent text-foreground",
                  !active && "border-transparent",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.7} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-vault-bg/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={cn(
                  "relative flex min-h-12 flex-col items-center justify-center gap-1 py-2 text-[11px] text-muted-foreground",
                  active && "text-vault-brand",
                )}
              >
                {active ? (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-vault-brand" />
                ) : null}
                <Icon className="h-4 w-4" strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
