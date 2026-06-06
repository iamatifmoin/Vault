"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  PlusSquare,
  UserRound,
} from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { cn } from "@/lib/utils";

const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/add",
    label: "Add Problem",
    icon: PlusSquare,
  },
  {
    href: "/library",
    label: "Library",
    icon: BookOpen,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserRound,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed left-0 top-0 z-40 hidden h-screen w-sidebar-width flex-col border-r border-border bg-vault-bg py-gutter md:flex">
        <div className="px-container-padding pb-8">
          <AppLogo size="sm" />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          {navigation.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-9 items-center gap-3 border-l-2 px-4 text-sm text-muted-foreground transition-colors hover:bg-vault-surface hover:text-foreground",
                  active &&
                    "border-vault-brand bg-vault-surface text-foreground",
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
        <div className="grid grid-cols-4">
          {navigation.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-3 text-[11px] text-muted-foreground",
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
