"use client";

import { useState } from "react";
import { Loader2, Vault } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      onClick={() => {
        setLoading(true);
        void signIn("github", { callbackUrl: "/dashboard" });
      }}
      className="h-12 w-full rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Vault className="mr-2 h-4 w-4" />
      )}
      Continue with GitHub
    </Button>
  );
}
