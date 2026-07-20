import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  resolvePortalTheme,
  resolveServiceType,
  type PortalTheme,
  type ServiceType,
} from "@/lib/auth/service-type";
import {
  parseNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/auth/notification-preferences";

export type AppSession = {
  userId: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string | null;
  serviceType: ServiceType;
  theme: PortalTheme;
  notificationPreferences: NotificationPreferences;
};

export const getAppSession = cache(async (): Promise<AppSession | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "email, name, first_name, last_name, phone_number, avatar_url, service_type, notification_preferences",
    )
    .eq("id", user.id)
    .maybeSingle();

  const serviceType = resolveServiceType(profile?.service_type);
  const firstName = profile?.first_name?.trim() || "";
  const lastName = profile?.last_name?.trim() || "";
  const displayName =
    profile?.name?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    user.email?.split("@")[0] ||
    "Member";

  return {
    userId: user.id,
    email: profile?.email || user.email || "",
    displayName,
    firstName,
    lastName,
    phoneNumber: profile?.phone_number?.trim() || "",
    avatarUrl: profile?.avatar_url?.trim() || null,
    serviceType,
    theme: resolvePortalTheme(serviceType),
    notificationPreferences: parseNotificationPreferences(
      profile?.notification_preferences,
    ),
  };
});
