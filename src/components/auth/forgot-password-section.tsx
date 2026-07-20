"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordSection() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();

    try {
      const supabase = createClient();
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin.replace(/\/$/, "")}/auth/confirm?next=/update-password`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-16 lg:grid-cols-12">
        <div className="relative hidden h-[600px] overflow-hidden rounded-xl bg-surface-container-low lg:col-span-6 lg:block">
          <div className="absolute inset-0 z-10 bg-gradient-to-tr from-surface/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed-dim/40 via-surface-container to-secondary-container" />
          <div className="absolute bottom-12 left-12 z-20 max-w-xs">
            <p className="font-headline text-3xl italic leading-snug text-on-surface">
              &ldquo;Finding your way back — one step at a time.&rdquo;
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left">
          <div className="w-full max-w-md">
            <h1 className="mb-4 font-headline text-3xl leading-tight tracking-tight text-on-surface sm:text-4xl md:text-5xl lg:text-6xl">
              Reset your password
            </h1>
            <p className="mb-8 font-body text-base leading-relaxed text-on-surface-variant sm:mb-12 sm:text-lg">
              Enter your email address and we&apos;ll send you a link to get back into your account.
            </p>

            <form className="space-y-10" onSubmit={onSubmit}>
              <div className="group relative border-b border-outline-variant/60 transition-all duration-300 focus-within:border-primary">
                <label
                  htmlFor="email"
                  className="mb-2 block font-label text-xs uppercase tracking-widest text-on-surface-variant transition-colors group-focus-within:text-primary"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="block w-full border-none bg-transparent px-0 py-4 font-body text-xl text-on-surface outline-none"
                />
              </div>
              {error ? (
                <p className="text-sm text-tertiary" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-primary px-8 py-5 font-body text-lg font-semibold tracking-wide text-on-primary shadow-soft transition-all duration-300 hover:bg-on-primary-fixed-variant active:scale-[0.98] disabled:opacity-60"
              >
                {pending ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-10 flex items-center justify-center gap-2 lg:justify-start">
              <ArrowLeft size={14} className="text-on-surface-variant" />
              <Link
                href="/sign-in"
                className="font-body text-sm text-on-surface-variant underline underline-offset-4 transition-colors hover:text-primary"
              >
                Back to sign-in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {sent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-8 text-center shadow-soft"
            >
              <CheckCircle2 className="mx-auto mb-4 text-primary" size={40} />
              <h2 className="font-headline text-2xl text-on-surface">Check your email</h2>
              <p className="mt-3 font-body text-on-surface-variant">
                If an account exists for that address, we sent a password reset link.
              </p>
              <Link
                href="/sign-in"
                className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3 font-semibold text-on-primary"
              >
                Back to sign-in
              </Link>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
