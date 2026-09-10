import posthog from 'posthog-js';
import { storage } from './storage';

export type AnalyticsEvent =
  | 'app_open'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'blessing_viewed'
  | 'blessing_completed'
  | 'value_reflection_started'
  | 'value_reflection_completed'
  | 'value_reflection_skipped'
  | 'journal_opened'
  | 'consistency_opened'
  | 'settings_opened'
  | 'privacy_policy_opened'
  | 'notification_permission_requested'
  | 'notification_permission_granted'
  | 'notification_permission_denied'
  | 'daily_reminder_scheduled'
  | 'backup_exported'
  | 'backup_imported'
  | 'backup_import_failed'
  | 'personal_blessing_created'
  | 'personal_blessing_opened'
  | 'personal_blessing_edited'
  | 'personal_blessing_deleted'
  | 'personal_blessing_favorited'
  | 'theme_changed'
  | 'reminder_set'
  | 'reflection_step_viewed'
  | 'dhikr_session'
  | 'reflection_completed'
  | 'journal_saved'
  | 'reflection_started';

export type ConsentState = 'granted' | 'denied' | 'unset';

const CONSENT_KEY = 'alhamd:analytics_consent';
let isInitialized = false;

// Async getter for consent
export const getConsent = async (): Promise<ConsentState> => {
  const value = await storage.getItem(CONSENT_KEY);
  if (value === 'granted' || value === 'denied') return value as ConsentState;
  return 'unset';
};

// Async setter for consent
export const setConsent = async (consent: 'granted' | 'denied'): Promise<void> => {
  await storage.setItem(CONSENT_KEY, consent);
  if (consent === 'granted') {
    initPostHog();
  } else {
    if (isInitialized) {
      posthog.opt_out_capturing();
    }
  }
};

const initPostHog = () => {
  if (isInitialized) return;
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
  if (!posthogKey) return;

  posthog.init(posthogKey, {
    api_host: 'https://eu.i.posthog.com',
    autocapture: false,
    disable_session_recording: true,
    opt_out_capturing_by_default: true,
  });
  
  posthog.opt_in_capturing();
  isInitialized = true;
};

// Initialize early if already granted
getConsent().then(consent => {
  if (consent === 'granted') {
    initPostHog();
  }
});

export const analytics = {
  async capture(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) {
    const consent = await getConsent();
    if (consent !== 'granted' || !isInitialized) {
      console.debug(`[Analytics Track (Skipped)] ${event}`, properties);
      return;
    }
    
    posthog.capture(event, properties);
  }
};
