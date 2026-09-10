import { Capacitor } from '@capacitor/core';

export interface DailyNotificationOptions {
  id: number;
  title: string;
  body: string;
  hour: number;
  minute: number;
}

export const notifications = {
  async requestPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const { display } = await LocalNotifications.requestPermissions();
      return display === 'granted';
    } else {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          if (Notification.permission === 'granted') return true;
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        } catch (e) {
          return false;
        }
      }
      return false;
    }
  },

  async scheduleDaily(options: DailyNotificationOptions): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.schedule({
        notifications: [
          {
            id: options.id,
            title: options.title,
            body: options.body,
            schedule: {
              on: {
                hour: options.hour,
                minute: options.minute
              },
              allowWhileIdle: true
            }
          }
        ]
      });
    } else {
      // Best-effort web fallback: scheduled/background notifications are unreliable on web.
       if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
           // We do not implement real scheduling on web as it requires active Service Workers running indefinitely
           console.log(`[Web Notifications] Scheduled daily at ${options.hour}:${options.minute}: ${options.title} (Native is required for reliable delivery)`);
       }
    }
  },

  async cancel(id: number): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } else {
      console.log(`[Web Notifications] Cancelled scheduled notification id ${id}`);
    }
  }
};
