"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ChevronRight, Key, Loader2, Upload } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useAppSession } from "@/components/auth/session-provider";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import {
  updateNotificationPreferencesAction,
  updateProfileAction,
  type SettingsActionState,
} from "@/lib/auth/settings-actions";
import type { NotificationPreferences } from "@/lib/auth/notification-preferences";
import { useDashboardData } from "@/lib/portal/client/use-dashboard-data";

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
  const { data: dashboardData } = useDashboardData();
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    session.notificationPreferences,
  );
  const [prefsMessage, setPrefsMessage] = useState<string | null>(null);
  const [prefsError, setPrefsError] = useState<string | null>(null);
  const [prefsPending, startPrefsTransition] = useTransition();
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const [avatarPreview, setAvatarPreview] = useState(session.avatarUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarDragOver, setAvatarDragOver] = useState(false);

  useEffect(() => {
    if (state.ok) setEditing(false);
  }, [state]);

  useEffect(() => {
    setPrefs(session.notificationPreferences);
  }, [session.notificationPreferences]);

  useEffect(() => {
    setAvatarPreview(session.avatarUrl);
  }, [session.avatarUrl]);

  const coachLabel = session.copy.coachNavLabel.replace(/^My /, "");
  const initial = (session.firstName || session.displayName || "?").slice(0, 1).toUpperCase();

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

  async function uploadAvatar(file: File) {
    setAvatarError(null);
    setAvatarPending(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/portal/avatar", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setAvatarPreview(json.avatarUrl || null);
      router.refresh();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAvatarPending(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  return (
    <PageShell width="narrow" className="space-y-12 sm:space-y-14">
      <PageHeader
        title="Settings"
        description="Manage your profile, photo, and how we notify you."
      />

      <section className="space-y-8" id="profile">
        <div className="flex items-end justify-between border-b border-outline-variant/40 pb-4">
          <h2 className="font-headline text-xl text-on-surface sm:text-2xl">Profile</h2>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 sm:p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Student profile
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Student name
              </p>
              <p className="mt-1 text-base font-medium text-on-surface">
                {dashboardData?.iepProfile?.childName || dashboardData?.studentName || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Grade level
              </p>
              <p className="mt-1 text-base font-medium text-on-surface">
                {dashboardData?.iepProfile?.gradeLevel || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                School district
              </p>
              <p className="mt-1 text-base font-medium text-on-surface">
                {dashboardData?.iepProfile?.schoolDistrict || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Current IEP status
              </p>
              <p className="mt-1 text-base font-medium text-on-surface">
                {dashboardData?.iepProfile?.currentIepStatus || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Primary disability
              </p>
              <p className="mt-1 text-base font-medium text-on-surface">
                {dashboardData?.iepProfile?.primaryDisability || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Current services
              </p>
              <p className="mt-1 text-base font-medium text-on-surface">
                {dashboardData?.iepProfile?.servicesReceived || "Not set"}
              </p>
            </div>
          </div>
          {dashboardData?.iepProfile?.accommodationsNeeded ? (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Accommodations from intake
              </p>
              <p className="mt-1 text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
                {dashboardData.iepProfile.accommodationsNeeded}
              </p>
            </div>
          ) : null}
          <p className="mt-3 text-xs text-on-surface-variant">
            Parent account details below are for login and communication. Student fields come
            from your IEP intake and are also used to seed Accommodations and Prep.
          </p>
        </div>

        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Profile photo
          </span>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadAvatar(file);
            }}
          />
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setAvatarDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setAvatarDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setAvatarDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setAvatarDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadAvatar(file);
            }}
            className={`flex flex-col items-center gap-4 rounded-xl border-2 border-dashed px-4 py-6 sm:flex-row sm:items-center ${
              avatarDragOver
                ? "border-primary bg-primary/5"
                : "border-outline-variant/50 bg-surface-container-low"
            }`}
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-2xl font-bold text-primary">
                {initial}
              </span>
            )}
            <div className="text-center sm:text-left">
              <p className="text-sm text-on-surface">
                Drag and drop a photo, or choose a file (PNG, JPG, WebP · max 5MB).
              </p>
              <button
                type="button"
                disabled={avatarPending}
                onClick={() => avatarInputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary disabled:opacity-60"
              >
                {avatarPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                {avatarPending ? "Uploading…" : "Upload photo"}
              </button>
              {avatarError ? (
                <p className="mt-2 text-sm text-tertiary" role="alert">
                  {avatarError}
                </p>
              ) : null}
            </div>
          </div>
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
          <h2 className="font-headline text-xl text-on-surface sm:text-2xl">Notifications</h2>
          <p className="page-lede mt-1 text-sm">
            Manage how you receive updates about your journey.
          </p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between py-2">
            <div className="max-w-md">
              <p className="font-medium text-on-surface">{coachLabel} Messages</p>
              <p className="text-sm text-on-surface-variant">
                Email notifications when your assigned {session.copy.coachNoun} sends a message.
              </p>
            </div>
            <Toggle
              id="toggle-messages"
              checked={prefs.coach_messages}
              disabled={prefsPending}
              onChange={(v) =>
                savePref({
                  ...prefs,
                  coach_messages: v,
                  meeting_reminders: false,
                  document_updates: false,
                })
              }
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
          <h2 className="font-headline text-xl text-on-surface sm:text-2xl">Account & security</h2>
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

      <section className="space-y-8 pb-16" id="support">
        <div className="border-b border-outline-variant/40 pb-4">
          <h2 className="font-headline text-xl text-on-surface sm:text-2xl">Support & legal</h2>
        </div>
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo href="/" size="sm" theme={session.theme} />
          <p className="text-xs text-on-surface-variant/60">
            SustainBL
            <br />© {new Date().getFullYear()} SustainBL. All rights reserved.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
