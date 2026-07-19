"use client";

import Link from "next/link";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { BrandLogo } from "@/components/brand/brand-logo";
import { signUpAction, type AuthActionResult } from "@/lib/auth/actions";

export function CreateAccountSection() {
  const [state, formAction, pending] = useActionState<AuthActionResult | undefined, FormData>(
    signUpAction,
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
            Create account
          </h1>
          <p className="max-w-md font-body text-lg text-on-surface-variant">
            Choose your program. Your account personalizes the portal for{" "}
            <span className="font-semibold text-on-surface">IEP Services</span> or{" "}
            <span className="font-semibold text-on-surface">Coaching</span>.
          </p>
        </header>

        <form action={formAction} className="w-full max-w-md space-y-8">
          <fieldset className="space-y-3">
            <legend className="font-label text-xs uppercase tracking-widest text-on-surface-variant/80">
              Program
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-outline-variant/70 bg-surface-container-lowest px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary-fixed/40">
                <input
                  type="radio"
                  name="serviceType"
                  value="iep"
                  defaultChecked
                  className="mt-1 accent-[var(--primary)]"
                />
                <span>
                  <span className="block font-body font-semibold text-on-surface">IEP Services</span>
                  <span className="block font-body text-xs text-on-surface-variant">
                    Honey &amp; forest theme
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-outline-variant/70 bg-surface-container-lowest px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary-fixed/40">
                <input
                  type="radio"
                  name="serviceType"
                  value="coaching"
                  className="mt-1 accent-[var(--primary)]"
                />
                <span>
                  <span className="block font-body font-semibold text-on-surface">Coaching</span>
                  <span className="block font-body text-xs text-on-surface-variant">
                    Burnt peach theme
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <div className="space-y-6">
            <div className="group flex flex-col space-y-2">
              <label
                htmlFor="fullName"
                className="font-label text-xs uppercase tracking-widest text-on-surface-variant/80 transition-colors group-focus-within:text-primary"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="Jordan Rivera"
                className="border-b border-outline-variant bg-transparent py-3 font-body text-lg text-on-surface outline-none transition-colors placeholder:text-outline-variant/60 focus:border-primary"
              />
            </div>
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
              <label
                htmlFor="password"
                className="font-label text-xs uppercase tracking-widest text-on-surface-variant/80 transition-colors group-focus-within:text-primary"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="border-b border-outline-variant bg-transparent py-3 font-body text-lg text-on-surface outline-none transition-colors placeholder:text-outline-variant/60 focus:border-primary"
              />
            </div>
            <div className="group flex flex-col space-y-2">
              <label
                htmlFor="confirmPassword"
                className="font-label text-xs uppercase tracking-widest text-on-surface-variant/80 transition-colors group-focus-within:text-primary"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
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
          {state?.success ? (
            <p className="font-body text-sm text-primary" role="status">
              {state.success}{" "}
              <Link href="/sign-in" className="font-bold underline">
                Sign in
              </Link>
            </p>
          ) : null}

          <div className="space-y-6 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-primary py-4 font-body font-semibold text-on-primary shadow-soft transition-all duration-300 hover:bg-on-primary-fixed-variant active:scale-[0.98] disabled:opacity-70"
            >
              {pending ? "Creating account..." : "Create Account"}
            </button>
            <div className="flex items-center justify-center space-x-2 font-body text-sm text-on-surface-variant">
              <span>Already have an account?</span>
              <Link href="/sign-in" className="font-bold text-primary transition-all hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </form>

        <div className="w-full max-w-md border-t border-outline-variant/30 pt-8">
          <div className="flex items-center space-x-4 opacity-60">
            <Shield size={20} />
            <p className="font-body text-xs leading-relaxed">
              Your information is protected. We only use it to set up your SustainBL portal.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="order-1 lg:order-2"
      >
        <AuthVisualPanel quote="You don't have to navigate this process alone — we'll walk it with you." />
      </motion.section>
    </div>
  );
}
