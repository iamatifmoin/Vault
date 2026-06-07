import { Sidebar } from "@/components/sidebar";

interface ProfileOwnerShellProps {
  login: string;
  user?: {
    name?: string | null;
    image?: string | null;
  };
  children: React.ReactNode;
}

export function ProfileOwnerShell({
  login,
  user,
  children,
}: ProfileOwnerShellProps) {
  return (
    <div className="vault-app-bg text-foreground">
      <Sidebar
        profileHref={`/u/${login}`}
        user={{
          name: user?.name,
          image: user?.image,
          login,
        }}
      />
      <div className="pb-20 md:pl-[220px] md:pb-0">{children}</div>
    </div>
  );
}
