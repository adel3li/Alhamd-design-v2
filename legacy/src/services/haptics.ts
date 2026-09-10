import { Capacitor } from '@capacitor/core';

export type ImpactStyle = 'light' | 'medium' | 'heavy';

export const haptics = {
  async impact(style: ImpactStyle = 'light'): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const { Haptics, ImpactStyle: NativeImpactStyle } = await import('@capacitor/haptics');
      const nativeStyle = 
        style === 'light' ? NativeImpactStyle.Light : 
        style === 'medium' ? NativeImpactStyle.Medium : 
        NativeImpactStyle.Heavy;
      await Haptics.impact({ style: nativeStyle });
    } else {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
          navigator.vibrate(duration);
        } catch (e) {
          // No-op if unsupported
        }
      }
    }
  },

  async success(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      await Haptics.notification({ type: NotificationType.Success });
    } else {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([10, 30, 20]);
        } catch (e) {
          // No-op
        }
      }
    }
  },

  async warning(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      await Haptics.notification({ type: NotificationType.Warning });
    } else {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([20, 30, 40]);
        } catch (e) {
          // No-op
        }
      }
    }
  }
};
