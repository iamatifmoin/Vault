import { Sidebar } from "@/components/sidebar";

interface ProfileOwnerShellProps {
  login: string;
  children: React.ReactNode;
}

export function ProfileOwnerShell({ login, children }: ProfileOwnerShellProps) {
  return (
    <div className="vault-app-bg text-foreground">
      <Sidebar profileHref={`/u/${login}`} />
      <div className="pb-20 md:pl-[220px] md:pb-0">{children}</div>
    </div>
  );
}
