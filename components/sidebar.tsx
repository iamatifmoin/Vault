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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarUser {
  name?: string | null;
  image?: string | null;
  login?: string | null;
}

interface SidebarProps {
  profileHref?: string;
  user?: SidebarUser;
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

function getAvatarUrl(user?: SidebarUser) {
  if (user?.image) {
    return user.image;
  }

  if (user?.login) {
    return `https://github.com/${user.login}.png`;
  }

  return undefined;
}

function ProfileNavIcon({
  user,
  active,
}: {
  user?: SidebarUser;
  active: boolean;
}) {
  const avatarUrl = getAvatarUrl(user);

  if (!avatarUrl) {
    return (
      <UserRound
        className={cn("h-4 w-4", active && "text-vault-brand")}
        strokeWidth={1.8}
      />
    );
  }

  return (
    <Avatar size="sm" className="size-5">
      <AvatarImage src={avatarUrl} alt={user?.name ?? "Profile"} />
      <AvatarFallback className="text-[10px]">
        {(user?.name ?? "V").slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}

export function Sidebar({ profileHref = "/profile", user }: SidebarProps) {
  const pathname = usePathname();
  const profileActive = pathname.startsWith(profileHref);
  const avatarUrl = getAvatarUrl(user);
  const mobileItems = [
    ...navigation,
    {
      href: profileHref,
      label: "Profile",
      icon: UserRound,
      isProfile: true,
    },
  ];

  return (
    <>
      <nav className="fixed left-0 top-0 z-40 hidden h-screen w-sidebar-width flex-col overflow-hidden border-r border-border bg-vault-bg md:flex">
        <div aria-hidden className="vault-brand-bleed" />

        <div className="relative shrink-0 px-4 pb-2 pt-6">
          <AppLogo size="md" />
        </div>

        <div className="relative flex flex-1 flex-col gap-0.5 overflow-y-auto pb-3 pt-8">
          {navigation.map((item) => {
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

        <div className="relative shrink-0 border-t border-border p-3">
          <Link
            href={profileHref}
            className={cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-vault-surface",
              profileActive
                ? "bg-gradient-to-r from-vault-brand-muted to-transparent text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {avatarUrl ? (
              <Avatar size="sm">
                <AvatarImage src={avatarUrl} alt={user?.name ?? "Profile"} />
                <AvatarFallback>{(user?.name ?? "V").slice(0, 1)}</AvatarFallback>
              </Avatar>
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                <UserRound className="h-4 w-4" strokeWidth={1.7} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium leading-none">
                {user?.name ?? "My Profile"}
              </p>
              {user?.login ? (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  @{user.login}
                </p>
              ) : null}
            </div>
          </Link>
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-vault-bg/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {mobileItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            const isProfile = "isProfile" in item && item.isProfile;

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
                {isProfile ? (
                  <ProfileNavIcon user={user} active={active} />
                ) : (
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
