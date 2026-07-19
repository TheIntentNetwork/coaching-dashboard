import { Sidebar } from "@/components/layout/sidebar";
import { SessionProvider } from "@/components/auth/session-provider";
import type { AppSession } from "@/lib/auth/session";

export function AppShell({
  session,
  children,
}: {
  session: AppSession;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <div
        data-theme={session.theme}
        className="min-h-screen overflow-x-hidden bg-background text-on-surface"
      >
        <Sidebar />
        <main className="min-h-screen pt-14 lg:ml-64 lg:pt-0">{children}</main>
      </div>
    </SessionProvider>
  );
}
