import Link from "next/link";
import type { Session } from "next-auth";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { ProfileOwnerShell } from "@/components/profile/profile-owner-shell";

interface ProfileOwnerEmptyProps {
  session: Session;
}

export function ProfileOwnerEmpty({ session }: ProfileOwnerEmptyProps) {
  const login = session.user.login ?? "github";

  return (
    <ProfileOwnerShell login={login}>
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-4 h-24 w-24 overflow-hidden rounded-full border border-border bg-vault-raised">
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? "Profile avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-2xl text-foreground">
              {(session.user.name ?? "V").slice(0, 1)}
            </div>
          )}
        </div>

        <h1 className="text-3xl font-semibold text-foreground">
          {session.user.name ?? "Vault User"}
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">@{login}</p>

        <p className="mt-6 text-muted-foreground">
          Your Vault profile is empty. Solve your first problem to get started.
        </p>

        <Button asChild className="mt-6">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>

        <LogoutButton />
      </main>
    </ProfileOwnerShell>
  );
}
