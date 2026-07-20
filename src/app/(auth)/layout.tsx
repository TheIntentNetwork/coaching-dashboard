export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-background text-on-surface">{children}</div>;
}
