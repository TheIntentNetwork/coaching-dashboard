"use client";

import Link from "next/link";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { BrandLogo } from "@/components/brand/brand-logo";
import { signInAction, type AuthActionResult } from "@/lib/auth/actions";

export function SignInSection() {
  const [state, formAction, pending] = useActionState<AuthActionResult | undefined, FormData>(
    signInAction,
    undefined,
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-24">
      <motion.section
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="order-2 flex flex-col items-start space-y-8 lg:order-1 lg:space-y-10"
      >
        <header className="space-y-4">
          <BrandLogo href="/sign-in" size="md" priority />
          <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-on-surface sm:text-5xl md:text-7xl">
            Welcome back
          </h1>
          <p className="max-w-md font-body text-lg text-on-surface-variant">
            Continue your IEP or coaching journey. Your session stays signed in across visits.
          </p>
        </header>

        <form action={formAction} className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <div className="group flex flex-col space-y-2">
              <label
                htmlFor="email"
                className="font-label text-xs uppercase tracking-widest text-on-surface-variant/80 transition-colors group-focus-within:text-primary"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                className="border-b border-outline-variant bg-transparent py-3 font-body text-lg text-on-surface outline-none transition-colors placeholder:text-outline-variant/60 focus:border-primary"
              />
            </div>
            <div className="group flex flex-col space-y-2">
              <div className="flex items-end justify-between">
                <label
                  htmlFor="password"
                  className="font-label text-xs uppercase tracking-widest text-on-surface-variant/80 transition-colors group-focus-within:text-primary"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="font-body text-xs text-on-surface-variant underline transition-colors hover:text-tertiary"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="border-b border-outline-variant bg-transparent py-3 font-body text-lg text-on-surface outline-none transition-colors placeholder:text-outline-variant/60 focus:border-primary"
              />
            </div>
          </div>

          {state?.error ? (
            <p className="font-body text-sm text-error" role="alert">
              {state.error}
            </p>
          ) : null}

          <div className="space-y-6 pt-4">
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-primary py-4 font-body font-semibold text-on-primary shadow-soft transition-all duration-300 hover:bg-on-primary-fixed-variant active:scale-[0.98] disabled:opacity-70"
            >
              {pending ? "Signing in..." : "Sign In"}
            </button>
            <div className="flex items-center justify-center space-x-2 font-body text-sm text-on-surface-variant">
              <span>New to SustainBL?</span>
              <Link
                href="/create-account"
                className="font-bold text-primary transition-all hover:underline"
              >
                Create an account
              </Link>
            </div>
          </div>
        </form>

        <div className="w-full max-w-md border-t border-outline-variant/30 pt-8">
          <div className="flex items-center space-x-4 opacity-60">
            <Shield size={20} />
            <p className="font-body text-xs leading-relaxed">
              Secure Supabase session. Colors and labels follow your program (IEP or Coaching).
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="order-1 lg:order-2"
      >
        <AuthVisualPanel quote="Clear prep and a calm voice — that's how families show up ready for the next meeting." />
      </motion.section>
    </div>
  );
}
