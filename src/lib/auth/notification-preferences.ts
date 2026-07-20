export type NotificationPreferences = {
  meeting_reminders: boolean;
  document_updates: boolean;
  coach_messages: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  meeting_reminders: true,
  document_updates: true,
  coach_messages: true,
};

export function parseNotificationPreferences(
  raw: unknown,
): NotificationPreferences {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
  const value = raw as Record<string, unknown>;
  return {
    meeting_reminders:
      typeof value.meeting_reminders === "boolean"
        ? value.meeting_reminders
        : DEFAULT_NOTIFICATION_PREFERENCES.meeting_reminders,
    document_updates:
      typeof value.document_updates === "boolean"
        ? value.document_updates
        : DEFAULT_NOTIFICATION_PREFERENCES.document_updates,
    coach_messages:
      typeof value.coach_messages === "boolean"
        ? value.coach_messages
        : DEFAULT_NOTIFICATION_PREFERENCES.coach_messages,
  };
}
