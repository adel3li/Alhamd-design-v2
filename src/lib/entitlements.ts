export const DEV_PREMIUM_STORAGE_KEY = 'alhamd:dev_premium';
export const ENTITLEMENT_CHANGED_EVENT = 'alhamd:entitlement_changed';
export const FREE_STATION_LIMIT = 2;

/**
 * «رحلتي» is free for everyone, like the rest of the app (owner's decision,
 * November 2026). With the paywall off, every premium check below answers
 * yes, and the paywall and the developer unlock in Settings are not rendered.
 *
 * If a paid tier is introduced later: set this to true, and first replace the
 * developer flag with a real purchase check (see the RevenueCat notes below).
 * As long as the flag is the only check, anyone can unlock from the UI.
 */
export const PAYWALL_ENABLED = false;

/**
 * Whether a station is outside the free taste: it comes after the first
 * FREE_STATION_LIMIT stations, or the user has already completed that many.
 * Only matters while PAYWALL_ENABLED is true.
 */
export function isBeyondFreeLimit(stationIndex: number, completedCount: number): boolean {
  return stationIndex >= FREE_STATION_LIMIT || completedCount >= FREE_STATION_LIMIT;
}

export type EntitlementPlan = 'free' | 'annual' | 'lifetime';

export interface EntitlementStatus {
  isPremium: boolean;
  plan: EntitlementPlan;
  source: 'local_dev' | 'revenuecat';
}

/**
 * Single entitlement service for «رحلتي» (Personal Journey — Premium).
 * Checks local upgrade status (`localStorage`) for development and testing.
 *
 * // TODO: RevenueCat
 * Replace the local flag check inside `isPremium()` and `getEntitlementStatus()` with RevenueCat SDK:
 * ```ts
 * const customerInfo = await Purchases.getCustomerInfo();
 * return Boolean(customerInfo.entitlements.active['journey_premium']);
 * ```
 * without touching any UI components.
 */
export async function isPremium(): Promise<boolean> {
  if (!PAYWALL_ENABLED) return true;
  // TODO: RevenueCat — integrate RevenueCat SDK (Purchases.getCustomerInfo()) here to verify active subscription entitlement
  return getDeveloperPremiumSync();
}

/**
 * Returns detailed entitlement status for UI inspection or paywall state.
 */
export async function getEntitlementStatus(): Promise<EntitlementStatus> {
  // TODO: RevenueCat — map active RevenueCat entitlement & productIdentifier here
  const active = await isPremium();
  return {
    isPremium: active,
    plan: active ? 'lifetime' : 'free',
    source: 'local_dev'
  };
}

/**
 * Synchronous read for local developer toggle state in Settings.
 */
export function getDeveloperPremiumSync(): boolean {
  if (!PAYWALL_ENABLED) return true;
  try {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DEV_PREMIUM_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Sets the local developer entitlement flag and notifies all subscribed listeners.
 */
export function setDeveloperPremium(enabled: boolean): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DEV_PREMIUM_STORAGE_KEY, String(enabled));
    window.dispatchEvent(
      new CustomEvent(ENTITLEMENT_CHANGED_EVENT, { detail: { isPremium: enabled } })
    );
  } catch {
    // Ignore storage errors in restricted environments
  }
}

/**
 * Convenience helper to flip the developer premium flag and return the new state.
 */
export function toggleDeveloperPremium(): boolean {
  const next = !getDeveloperPremiumSync();
  setDeveloperPremium(next);
  return next;
}

/**
 * Subscribes to entitlement state changes across the application.
 */
export function subscribeEntitlementChange(
  listener: (premium: boolean) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const handler = () => {
    void isPremium().then(listener);
  };
  window.addEventListener(ENTITLEMENT_CHANGED_EVENT, handler);
  return () => {
    window.removeEventListener(ENTITLEMENT_CHANGED_EVENT, handler);
  };
}

