"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="group relative transition-all duration-300">
      <label
        htmlFor={id}
        className="mb-2 block font-label text-xs uppercase tracking-widest text-on-surface-variant transition-colors group-focus-within:text-primary"
      >
        {label}
      </label>
      <div className="relative flex items-center border-b border-outline transition-colors duration-300 hover:border-primary focus-within:border-primary">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full border-none bg-transparent py-4 font-body text-lg text-on-surface outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-outline transition-colors hover:text-primary"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}

export function UpdatePasswordSection() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = useMemo(
    () => [
      { label: "8+ characters", ok: password.length >= 8 },
      { label: "One number", ok: /\d/.test(password) },
      { label: "One special char", ok: /[^A-Za-z0-9]/.test(password) },
      { label: "Mixed case", ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    ],
    [password],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!checks.every((c) => c.ok)) {
      setError("Please meet all password requirements.");
      return;
    }

    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }

    router.replace("/setup");
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl"
    >
      <div className="mb-10 text-center sm:mb-16">
        <h1 className="mb-4 font-headline text-4xl tracking-tight text-on-surface sm:mb-6 sm:text-5xl md:text-6xl">
          New Password
        </h1>
        <p className="mx-auto max-w-md font-body text-base leading-relaxed text-on-surface-variant sm:text-lg">
          Choose a secure password to finish setting up your SustainBL account.
        </p>
      </div>

      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6 shadow-soft sm:p-8 md:p-12">
        <form className="space-y-10" onSubmit={onSubmit}>
          <PasswordField
            id="new_password"
            label="New Password"
            value={password}
            onChange={setPassword}
          />
          <PasswordField
            id="confirm_password"
            label="Confirm Password"
            value={confirm}
            onChange={setConfirm}
          />

          <div className="grid grid-cols-2 gap-4 pt-4">
            {checks.map((c) => (
              <div
                key={c.label}
                className={`flex items-center gap-2 font-body text-xs ${
                  c.ok ? "text-primary" : "text-on-surface-variant/70"
                }`}
              >
                <CheckCircle2 size={14} />
                {c.label}
              </div>
            ))}
          </div>

          {error ? <p className="text-center text-sm text-error">{error}</p> : null}

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-5 font-body font-semibold text-on-primary shadow-soft transition-all duration-500 hover:bg-on-primary-fixed-variant active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Saving..." : "Update Password"}
            </button>
            <p className="mt-6 text-center font-body text-xs text-on-surface-variant">
              After this, you can sign in anytime with your email and new password.
            </p>
          </div>
        </form>
      </div>

      <div className="mt-16 opacity-40">
        <div className="flex justify-center gap-12">
          <div className="my-auto h-px w-12 bg-outline-variant" />
          <Shield className="text-primary" size={28} />
          <div className="my-auto h-px w-12 bg-outline-variant" />
        </div>
      </div>
    </motion.div>
  );
}
