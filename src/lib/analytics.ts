const CONSENT_STORAGE_KEY = 'alhamd:analytics_consent';
const ANALYTICS_LOG_KEY = 'alhamd:analytics_events_log';

/**
 * The daily reflection: the product's north star is reflections finished per
 * person per week, and the step events show where a reflection loses people.
 * Only content identifiers and step positions are recorded, never what the
 * user wrote.
 */
export type ReflectionAnalyticsEvent =
  | { name: 'reflection_started'; metadata: { blessing_id: string } }
  | { name: 'reflection_step_viewed'; metadata: { blessing_id: string; step_index: number; step_type: string } }
  | { name: 'reflection_completed'; metadata: { blessing_id: string } };

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
export function trackEvent(
  name: (JourneyAnalyticsEvent | ReflectionAnalyticsEvent)['name'],
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
      const allowedKeys = [
        'themes_count', 'pace', 'stage_id', 'station_index', 'plan',
        'blessing_id', 'step_index', 'step_type'
      ];
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

    // Store locally in a bounded (200-event) metadata ring buffer for verification / inspection
    const existingRaw = localStorage.getItem(ANALYTICS_LOG_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const next = Array.isArray(existing) ? [...existing.slice(-199), payload] : [payload];
    localStorage.setItem(ANALYTICS_LOG_KEY, JSON.stringify(next));
  } catch {
    // Silent fail on storage restriction
  }
}

/** Kept for the journey call sites; same consent gate and allow-list. */
export const trackJourneyEvent = trackEvent as (
  name: JourneyAnalyticsEvent['name'],
  metadata?: Record<string, string | number | boolean>
) => void;
