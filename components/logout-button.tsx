"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        setLoading(true);
        void signOut({ callbackUrl: "/" });
      }}
      disabled={loading}
      className="mt-4"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Log out
    </Button>
  );
}
