const CONSENT_STORAGE_KEY = 'alhamd:analytics_consent';
const ANALYTICS_LOG_KEY = 'alhamd:analytics_events_log';

export type JourneyAnalyticsEvent =
  | { name: 'journey_onboarded'; metadata: { themes_count: number; pace: 1 | 2 } }
  | { name: 'journey_station_completed'; metadata: { stage_id: string; station_index: number } }
  | { name: 'journey_stage_completed'; metadata: { stage_id: string } }
  | { name: 'journey_paywall_viewed'; metadata?: Record<string, never> }
  | { name: 'journey_paywall_cta_tapped'; metadata: { plan: 'annual' | 'lifetime' } };

/**
 * Consent-gated, metadata-only analytics helper.
 * Never accepts or transmits user reflection text, journal entries, or muhasaba answers.
 */
export function trackJourneyEvent(
  name: JourneyAnalyticsEvent['name'],
  metadata?: Record<string, string | number | boolean>
): void {
  try {
    const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (consent !== 'true') {
      return;
    }

    // Strictly sanitize metadata to ensure no private reflection text is ever included
    const safeMetadata: Record<string, string | number | boolean> = {};
    if (metadata) {
      const allowedKeys = ['themes_count', 'pace', 'stage_id', 'station_index', 'plan'];
      for (const key of allowedKeys) {
        if (key in metadata && metadata[key] !== undefined) {
          safeMetadata[key] = metadata[key];
        }
      }
    }

    const payload = {
      event: name,
      metadata: safeMetadata,
      timestamp: new Date().toISOString()
    };

    // Store locally in bounded metadata ring buffer for verification / inspection
    const existingRaw = localStorage.getItem(ANALYTICS_LOG_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const next = Array.isArray(existing) ? [...existing.slice(-49), payload] : [payload];
    localStorage.setItem(ANALYTICS_LOG_KEY, JSON.stringify(next));
  } catch {
    // Silent fail on storage restriction
  }
}
