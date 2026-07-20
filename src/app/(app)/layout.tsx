import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getAppSession } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <AppShell session={session}>{children}</AppShell>;
}
