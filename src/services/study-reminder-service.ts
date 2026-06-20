import AsyncStorage from "@react-native-async-storage/async-storage";
import { isRunningInExpoGo } from "expo";
import type * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";

const STUDY_REMINDER_ENABLED_KEY = "calculo.studyReminder.enabled.v1";
const STUDY_REMINDER_IDENTIFIER = "calculo-study-reminder-every-10-minutes";
const STUDY_REMINDER_CHANNEL_ID = "study-reminders";
const STUDY_REMINDER_INTERVAL_SECONDS = 10 * 60;
export const STUDY_REMINDER_MESSAGE = "เริ่มเรียนคณิตกัน!";

let notificationHandlerConfigured = false;
let notificationsModule: typeof ExpoNotifications | null = null;

export function isStudyReminderSupported() {
  return Platform.OS !== "web" && !(Platform.OS === "android" && isRunningInExpoGo());
}

async function getNotificationsModule() {
  if (!isStudyReminderSupported()) {
    return null;
  }

  if (!notificationsModule) {
    notificationsModule = await import("expo-notifications");
  }

  return notificationsModule;
}

function configureNotificationHandler(
  Notifications: typeof ExpoNotifications,
) {
  if (notificationHandlerConfigured || !isStudyReminderSupported()) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  notificationHandlerConfigured = true;
}

async function ensureReminderChannel(
  Notifications: typeof ExpoNotifications,
) {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(STUDY_REMINDER_CHANNEL_ID, {
    importance: Notifications.AndroidImportance.DEFAULT,
    name: "Study reminders",
  });
}

async function requestReminderPermission() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.status === "granted") {
    return true;
  }

  const nextPermission = await Notifications.requestPermissionsAsync();
  return nextPermission.status === "granted";
}

export async function getStudyReminderEnabled() {
  const storedValue = await AsyncStorage.getItem(STUDY_REMINDER_ENABLED_KEY);
  return storedValue !== "false";
}

export async function cancelStudyReminderNotifications() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(
      STUDY_REMINDER_IDENTIFIER,
    );
  } catch {
    // The reminder may not exist yet, which is fine.
  }
}

export async function scheduleStudyReminderNotification() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  configureNotificationHandler(Notifications);

  const granted = await requestReminderPermission();
  if (!granted) {
    await cancelStudyReminderNotifications();
    return false;
  }

  await ensureReminderChannel(Notifications);
  await cancelStudyReminderNotifications();
  await Notifications.scheduleNotificationAsync({
    content: {
      data: { kind: "study-reminder" },
      title: STUDY_REMINDER_MESSAGE,
    },
    identifier: STUDY_REMINDER_IDENTIFIER,
    trigger: {
      channelId: STUDY_REMINDER_CHANNEL_ID,
      repeats: true,
      seconds: STUDY_REMINDER_INTERVAL_SECONDS,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });

  return true;
}

export async function setStudyReminderEnabled(enabled: boolean) {
  await AsyncStorage.setItem(
    STUDY_REMINDER_ENABLED_KEY,
    enabled ? "true" : "false",
  );

  if (!enabled) {
    await cancelStudyReminderNotifications();
    return false;
  }

  const scheduled = await scheduleStudyReminderNotification();
  if (!scheduled) {
    await AsyncStorage.setItem(STUDY_REMINDER_ENABLED_KEY, "false");
  }

  return scheduled;
}

export async function initializeStudyReminderNotifications() {
  if (!isStudyReminderSupported()) {
    return false;
  }

  const enabled = await getStudyReminderEnabled();
  if (!enabled) {
    await cancelStudyReminderNotifications();
    return false;
  }

  const scheduled = await scheduleStudyReminderNotification();
  if (!scheduled) {
    await AsyncStorage.setItem(STUDY_REMINDER_ENABLED_KEY, "false");
  }

  return scheduled;
}
