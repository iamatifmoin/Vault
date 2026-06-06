"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  PlusSquare,
  UserRound,
  Vault,
} from "lucide-react";
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
      <nav className="fixed left-0 top-0 z-40 hidden h-screen w-sidebar-width flex-col border-r border-vault-border bg-vault-bg py-gutter md:flex">
        <div className="px-container-padding pb-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-50">
            <Vault className="h-4 w-4 text-emerald-400" />
            <span>Vault</span>
          </div>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">
            DSA Tracker
          </p>
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
                  "flex h-8 items-center gap-3 border-l-2 px-4 text-sm text-zinc-400 transition-colors hover:bg-vault-surface hover:text-zinc-50",
                  active &&
                    "border-zinc-50 bg-vault-surface text-zinc-50",
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

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-vault-border bg-vault-bg/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          {navigation.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[11px] text-zinc-500",
                  active && "text-zinc-50",
                )}
              >
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
