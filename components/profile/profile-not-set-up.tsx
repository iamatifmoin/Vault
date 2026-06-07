import Link from "next/link";
import { AppLogo } from "@/components/app-logo";

interface ProfileNotSetUpProps {
  username: string;
}

export function ProfileNotSetUp({ username }: ProfileNotSetUpProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-700 px-6 py-4">
        <Link href="/">
          <AppLogo size="sm" />
        </Link>
      </header>

      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-sm uppercase tracking-wider text-zinc-500">
          Vault Profile
        </p>
        <h1 className="mt-3 text-3xl font-semibold">@{username}</h1>
        <p className="mt-4 text-zinc-400">This profile hasn&apos;t been set up yet.</p>
        <p className="mt-2 text-sm text-zinc-500">
          Connect Vault and start solving problems to build your public profile.
        </p>
      </main>
    </div>
  );
}
