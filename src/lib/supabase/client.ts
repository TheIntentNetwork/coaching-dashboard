import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Recovery/invite links are exchanged server-side at /auth/confirm.
        // Avoid client-side URL session detection (can remount auth pages).
        detectSessionInUrl: false,
      },
    },
  );
}
