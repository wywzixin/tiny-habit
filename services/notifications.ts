import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { MicroBehavior } from '../types/habit';
import { Language, t } from '../utils/i18n';

const REMINDER_CHANNEL_ID = 'habit-reminders';

export const initializeNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

const ensureNotificationPermissions = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

const toExpoWeekday = (backendWeekday: number) => {
  return backendWeekday === 7 ? 1 : backendWeekday + 1;
};

const parseReminderTime = (time?: string) => {
  if (!time) return null;
  const [hh, mm] = time.split(':').map((v) => Number(v));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return { hour: hh, minute: mm };
};

export const scheduleHabitReminders = async (behaviors: MicroBehavior[], language: Language, enabled: boolean) => {
  if (!enabled) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }
  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const reminderBehaviors = behaviors.filter(
    (b) => b.reminderEnabled && b.reminderTime && b.frequency?.length
  );

  for (const behavior of reminderBehaviors) {
    const time = parseReminderTime(behavior.reminderTime);
    if (!time) continue;

    for (const backendDay of behavior.frequency) {
      const weekday = toExpoWeekday(backendDay);
      const anchorText = behavior.anchor?.trim();
      const behaviorText = behavior.behavior?.trim();
      const fallbackText = behaviorText || behavior.name || t(language, 'reminder.title');
      const sentence = anchorText && behaviorText
        ? `${anchorText}${t(language, 'reminder.noticeSuffix')}${behaviorText}${t(language, 'reminder.noticeEnding')}`
        : fallbackText;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: sentence,
          data: {
            microBehaviorId: behavior.id,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday,
          hour: time.hour,
          minute: time.minute,
          repeats: true,
          channelId: REMINDER_CHANNEL_ID,
        },
      });
    }
  }
};
