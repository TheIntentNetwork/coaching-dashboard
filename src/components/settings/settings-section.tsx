"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { ChevronRight, Key } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useAppSession } from "@/components/auth/session-provider";
import {
  updateNotificationPreferencesAction,
  updateProfileAction,
  type SettingsActionState,
} from "@/lib/auth/settings-actions";
import type { NotificationPreferences } from "@/lib/auth/notification-preferences";

function Toggle({
  checked,
  onChange,
  id,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-12 rounded-full transition-colors disabled:opacity-60 ${
        checked ? "bg-primary-fixed" : "bg-surface-container-high"
      }`}
    >
      <span
        className={`absolute top-0 h-6 w-6 rounded-full border-2 transition-all ${
          checked
            ? "right-0 border-primary bg-primary"
            : "left-0 border-outline-variant bg-white"
        }`}
      />
    </button>
  );
}

const initialState: SettingsActionState = { ok: false };

export function SettingsSection() {
  const session = useAppSession();
  const [editing, setEditing] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    session.notificationPreferences,
  );
  const [prefsMessage, setPrefsMessage] = useState<string | null>(null);
  const [prefsError, setPrefsError] = useState<string | null>(null);
  const [prefsPending, startPrefsTransition] = useTransition();
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.ok) setEditing(false);
  }, [state]);

  useEffect(() => {
    setPrefs(session.notificationPreferences);
  }, [session.notificationPreferences]);

  const coachLabel = session.copy.coachNavLabel.replace(/^My /, "");

  function savePref(next: NotificationPreferences) {
    setPrefs(next);
    setPrefsMessage(null);
    setPrefsError(null);
    startPrefsTransition(async () => {
      const result = await updateNotificationPreferencesAction(next);
      if (!result.ok) {
        setPrefsError(result.error || "Could not save preferences.");
        setPrefs(session.notificationPreferences);
        return;
      }
      setPrefsMessage(result.message || "Saved.");
    });
  }

  return (
    <div className="page-pad mx-auto w-full max-w-3xl space-y-12 sm:space-y-16 md:space-y-24">
      <div className="mb-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight text-on-surface">
          Settings
        </h1>
      </div>

      <section className="space-y-8" id="profile">
        <div className="flex items-end justify-between border-b border-outline-variant/40 pb-4">
          <h2 className="font-headline text-2xl text-on-surface">Profile Settings</h2>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <form action={formAction} className="space-y-6">
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                First name
              </span>
              <input
                name="first_name"
                defaultValue={session.firstName}
                className="w-full border-b border-outline-variant bg-transparent py-2 text-lg outline-none focus:border-primary"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Last name
              </span>
              <input
                name="last_name"
                defaultValue={session.lastName}
                className="w-full border-b border-outline-variant bg-transparent py-2 text-lg outline-none focus:border-primary"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Phone number
              </span>
              <input
                name="phone_number"
                defaultValue={session.phoneNumber}
                className="w-full border-b border-outline-variant bg-transparent py-2 text-lg outline-none focus:border-primary"
              />
            </label>
            <div>
              <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Email Address
              </span>
              <p className="text-lg font-medium text-on-surface">{session.email}</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Email is managed by your sign-in account.
              </p>
            </div>
            {state.error ? (
              <p className="text-sm text-tertiary" role="alert">
                {state.error}
              </p>
            ) : null}
            {state.ok && state.message ? (
              <p className="text-sm text-primary" role="status">
                {state.message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save profile"}
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-y-6">
            <div>
              <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Full Name
              </span>
              <p className="text-lg font-medium text-on-surface">{session.displayName}</p>
            </div>
            <div>
              <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Email Address
              </span>
              <p className="text-lg font-medium text-on-surface">{session.email}</p>
            </div>
            <div>
              <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Phone Number
              </span>
              <p className="text-lg font-medium text-on-surface">
                {session.phoneNumber || "Not set"}
              </p>
            </div>
            <div>
              <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Program
              </span>
              <p className="text-lg font-medium text-on-surface">{session.copy.programLabel}</p>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-8" id="notifications">
        <div className="border-b border-outline-variant/40 pb-4">
          <h2 className="font-headline text-2xl text-on-surface">Notification Preferences</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage how you receive updates about your journey.
          </p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between py-2">
            <div className="max-w-md">
              <p className="font-medium text-on-surface">Meeting Reminders</p>
              <p className="text-sm text-on-surface-variant">
                Get notified before scheduled meetings.
              </p>
            </div>
            <Toggle
              id="toggle-meetings"
              checked={prefs.meeting_reminders}
              disabled={prefsPending}
              onChange={(v) => savePref({ ...prefs, meeting_reminders: v })}
            />
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant/20 pt-6">
            <div className="max-w-md">
              <p className="font-medium text-on-surface">Document Updates</p>
              <p className="text-sm text-on-surface-variant">
                Alerts when new documents are added to SustainBL.
              </p>
            </div>
            <Toggle
              id="toggle-docs"
              checked={prefs.document_updates}
              disabled={prefsPending}
              onChange={(v) => savePref({ ...prefs, document_updates: v })}
            />
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant/20 pt-6">
            <div className="max-w-md">
              <p className="font-medium text-on-surface">{coachLabel} Messages</p>
              <p className="text-sm text-on-surface-variant">
                Notifications when your assigned {session.copy.coachNoun} sends a message.
              </p>
            </div>
            <Toggle
              id="toggle-messages"
              checked={prefs.coach_messages}
              disabled={prefsPending}
              onChange={(v) => savePref({ ...prefs, coach_messages: v })}
            />
          </div>
          {prefsError ? (
            <p className="text-sm text-tertiary" role="alert">
              {prefsError}
            </p>
          ) : null}
          {prefsMessage ? (
            <p className="text-sm text-primary" role="status">
              {prefsMessage}
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-8" id="security">
        <div className="border-b border-outline-variant/40 pb-4">
          <h2 className="font-headline text-2xl text-on-surface">Account & Security</h2>
        </div>
        <div className="space-y-2">
          <Link
            href="/update-password"
            className="group flex w-full items-center justify-between rounded-xl p-4 transition-all hover:bg-surface-variant"
          >
            <div className="flex items-center gap-4">
              <Key className="text-primary" size={20} />
              <span className="font-medium">Change Password</span>
            </div>
            <ChevronRight className="text-outline transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <section className="space-y-8 pb-24" id="support">
        <div className="border-b border-outline-variant/40 pb-4">
          <h2 className="font-headline text-2xl text-on-surface">Support & Legal</h2>
        </div>
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo href="/" size="sm" theme={session.theme} />
          <p className="text-xs text-on-surface-variant/60">
            SustainBL
            <br />© {new Date().getFullYear()} SustainBL. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
