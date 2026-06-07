"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppLogo } from "@/components/app-logo";
import { notifyExtension } from "@/lib/extension";

interface ExtensionSession {
  accessToken?: string;
  user?: {
    name?: string | null;
    login?: string;
    image?: string | null;
  };
}

export default function ExtensionSuccessPage() {
  const [session, setSession] = useState<ExtensionSession | null>(null);
  const [extensionLinked, setExtensionLinked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let closeTimer: number | undefined;

    async function completeAuth() {
      try {
        const response = await fetch("/api/auth/session");
        const data = (await response.json()) as ExtensionSession | null;

        if (!data?.accessToken) {
          setSession(null);
          return;
        }

        setSession(data);

        if (process.env.NODE_ENV === "development") {
          console.log(
            "[extension-success] github access token present:",
            Boolean(data.accessToken),
          );
        }

        const username =
          data.user?.login ?? data.user?.name ?? "vault-user";

        const linked = await notifyExtension(data.accessToken, username);
        setExtensionLinked(linked);

        if (linked) {
          closeTimer = window.setTimeout(() => {
            window.close();
          }, 2000);
        }
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    void completeAuth();

    return () => {
      if (closeTimer !== undefined) {
        window.clearTimeout(closeTimer);
      }
    };
  }, []);

  const displayName =
    session?.user?.login ?? session?.user?.name ?? "Vault user";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="surface-card w-full max-w-md p-8 text-center">
        <div className="mb-8 flex justify-center">
          <AppLogo size="sm" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Finishing connection…
            </p>
          </div>
        ) : session?.accessToken && extensionLinked ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2
                className="h-10 w-10 text-emerald-500"
                strokeWidth={1.6}
              />
              <h1 className="text-page-title">Connected to Vault ✓</h1>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-md border border-border bg-vault-bg px-4 py-3">
              <Avatar size="sm">
                {session.user?.image ? (
                  <AvatarImage src={session.user.image} alt={displayName} />
                ) : null}
                <AvatarFallback>
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-foreground">{displayName}</p>
            </div>

            <p className="text-sm text-muted-foreground">
              This window will close automatically
            </p>
          </div>
        ) : session?.accessToken ? (
          <div className="space-y-4 py-2">
            <h1 className="text-page-title">Extension not linked</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              You are signed in to Vault, but the browser extension did not
              receive your token. Reload the extension in{" "}
              <code className="text-foreground">chrome://extensions</code>,
              confirm{" "}
              <code className="text-foreground">
                NEXT_PUBLIC_CHROME_EXTENSION_ID
              </code>{" "}
              matches your extension ID, then refresh this page.
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <h1 className="text-page-title">Connection incomplete</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Sign in through the Vault extension to link your GitHub account.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
