"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { NotificationPreferences } from "@/lib/auth/notification-preferences";

export type SettingsActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function updateProfileAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const firstName = String(formData.get("first_name") || "").trim();
  const lastName = String(formData.get("last_name") || "").trim();
  const phoneNumber = String(formData.get("phone_number") || "").trim();
  const name =
    String(formData.get("name") || "").trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim();

  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      first_name: firstName || null,
      last_name: lastName || null,
      phone_number: phoneNumber || null,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/settings");
  return { ok: true, message: "Profile saved." };
}

export async function updateNotificationPreferencesAction(
  prefs: NotificationPreferences,
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      notification_preferences: {
        meeting_reminders: Boolean(prefs.meeting_reminders),
        document_updates: Boolean(prefs.document_updates),
        coach_messages: Boolean(prefs.coach_messages),
      },
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/settings");
  return { ok: true, message: "Notification preferences saved." };
}
