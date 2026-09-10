import { Capacitor } from '@capacitor/core';

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return localStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  }
};
