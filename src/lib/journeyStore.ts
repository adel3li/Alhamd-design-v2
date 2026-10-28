import journeyContentRaw from '../data/journey_content.json';
import { JourneyState, JourneyStage, JourneyStation } from '../types';

export type { JourneyState, JourneyStage, JourneyStation };

export interface AuthoredTextField {
  text: string;
  reviewStatus: 'pending_review' | 'approved';
  reviewedBy?: string;
  reviewDate?: string | null;
}

export interface SacredPlaceholderField {
  token: '[[AYAH_TOKEN]]' | '[[HADITH_TOKEN]]';
  verifiedVerbatim: boolean;
  reviewStatus: 'pending_review' | 'approved';
  reviewedBy?: string;
  reviewDate?: string | null;
}

export interface JourneyStationContent {
  blessingId: string;
  reviewStatus?: 'pending_review' | 'approved';
  journalPrompt: AuthoredTextField;
  dailyAction: AuthoredTextField;
  sacredPlaceholder?: SacredPlaceholderField;
  dhikrPlaceholder?: SacredPlaceholderField;
}

export interface JourneyStageContent {
  id: string;
  theme: string;
  focusLabel: string;
  focusDescription: string;
  title: string;
  reviewStatus?: 'pending_review' | 'approved';
  reviewedBy?: string;
  reviewDate?: string | null;
  intention: AuthoredTextField;
  stations: JourneyStationContent[];
}

export interface JourneyContentFile {
  schemaVersion: number;
  reviewStatus: string;
  reviewedBy?: string;
  reviewDate?: string | null;
  contentNote: string;
  stages: JourneyStageContent[];
}

export const JOURNEY_STORAGE_KEY = 'alhamd:journey_state:v1';
export const JOURNEY_ONBOARDED_KEY = 'alhamd:journey_onboarded:v1';
export const JOURNEY_UPDATED_EVENT = 'alhamd:journey_updated';

const journeyContent = journeyContentRaw as unknown as JourneyContentFile;

/**
 * Returns local date formatted as "YYYY-MM-DD"
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deterministic station ID for a stage and 0-based station index
 */
export function makeStationId(stageId: string, stationIndex: number): string {
  return `${stageId}_station_${stationIndex + 1}`;
}

/**
 * Returns structured JourneyStation items for a given stage, hydrated with local completion and journal state.
 */
export function getStageStations(state: JourneyState, stageId: string): JourneyStation[] {
  const stage = state.stages.find((s) => s.id === stageId);
  if (!stage) return [];
  return stage.stationBlessingIds.map((blessingId, idx) => {
    const id = makeStationId(stage.id, idx);
    return {
      id,
      stageId: stage.id,
      stationIndex: idx,
      blessingId,
      completedAt: state.completed[id]?.completedAt,
      journalText: state.journal[id]
    };
  });
}

/**
 * Returns all available stage templates from journey_content.json
 */
export function getAllStageTemplates(): JourneyStageContent[] {
  return journeyContent.stages;
}

/**
 * Finds stage content metadata (intention, station prompts/actions) by stage ID or theme
 */
export function getStageContent(stageId: string, theme?: string): JourneyStageContent | undefined {
  return (
    journeyContent.stages.find((s) => s.id === stageId) ||
    (theme ? journeyContent.stages.find((s) => s.theme === theme) : undefined)
  );
}

/**
 * Returns station authored content (journalPrompt, dailyAction) for a given stage & station index
 */
export function getStationContent(
  stageId: string,
  stationIndex: number,
  blessingId: string
): JourneyStationContent {
  const stage = getStageContent(stageId);
  const found =
    stage?.stations[stationIndex] ||
    stage?.stations.find((st) => st.blessingId === blessingId);

  if (found) {
    return found;
  }

  return {
    blessingId,
    journalPrompt: {
      text: 'اكتب موقفًا شعرت فيه بقيمة هذه النعمة.',
      reviewStatus: 'pending_review'
    },
    dailyAction: {
      text: 'اشكر من أعانك اليوم بكلمة.',
      reviewStatus: 'pending_review'
    },
    sacredPlaceholder: {
      token: '[[AYAH_TOKEN]]',
      verifiedVerbatim: false,
      reviewStatus: 'pending_review'
    }
  };
}

/**
 * Builds ordered stages from selected focus themes.
 * Always guarantees at least the 2 sample stages of 7 stations each if selection is empty.
 */
export function buildStagesFromThemes(selectedThemes: string[]): JourneyStage[] {
  const templates = getAllStageTemplates();
  const orderedTemplates: JourneyStageContent[] = [];

  for (const rawKey of selectedThemes) {
    const themeKey = rawKey.trim();
    const match = templates.find(
      (t) =>
        t.theme === themeKey ||
        t.id === themeKey ||
        t.focusLabel === themeKey ||
        (themeKey === 'العبادات' && t.theme === 'din') ||
        (themeKey === 'البدن' && t.theme === 'afiyah') ||
        (themeKey === 'الأهل' && t.theme === 'nasl') ||
        (themeKey === 'الرزق' && t.theme === 'rizq')
    );
    if (match && !orderedTemplates.some((o) => o.id === match.id)) {
      orderedTemplates.push(match);
    }
  }

  // Fallback to first 2 stages ('din' and 'afiyah') if selection is empty
  if (orderedTemplates.length === 0) {
    orderedTemplates.push(...templates.slice(0, 2));
  }

  return orderedTemplates.map((tpl) => {
    const stationBlessingIds = tpl.stations.slice(0, 7).map((st) => st.blessingId);
    const stations: JourneyStation[] = stationBlessingIds.map((blessingId, idx) => ({
      id: makeStationId(tpl.id, idx),
      stageId: tpl.id,
      stationIndex: idx,
      blessingId
    }));
    return {
      id: tpl.id,
      theme: tpl.theme,
      title: tpl.title,
      stationBlessingIds,
      stations
    };
  });
}

/**
 * Creates a default initial JourneyState (used for free preview or fallback on corrupt data).
 * All reflective texts (`journal`, `muhasaba`) stay strictly on the local device.
 */
export function createDefaultJourneyState(): JourneyState {
  const todayLocal = getLocalDateString();
  const defaultThemes = ['din', 'afiyah'];
  const stages = buildStagesFromThemes(defaultThemes);
  const stations = stages.flatMap((stage) => stage.stations || []);
  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    focusThemes: defaultThemes,
    pace: 1,
    reminderTime: '21:00',
    stages,
    stations,
    completed: {},
    unlockedTodayCount: 0,
    lastUnlockDate: todayLocal,
    journal: {},
    muhasaba: {}
  };
}

/**
 * Synchronizes daily unlock window with the current local date.
 * Never resets, locks, or decays past progress.
 */
export function syncDailyUnlockWindow(state: JourneyState): JourneyState {
  const todayLocal = getLocalDateString();
  if (state.lastUnlockDate !== todayLocal) {
    return {
      ...state,
      unlockedTodayCount: 0,
      lastUnlockDate: todayLocal
    };
  }
  return state;
}

/**
 * Sanitizes any raw object into a valid JourneyState.
 * Reflective texts (`journal` and `muhasaba`) are stored locally on the user's device only
 * and are never transmitted to any external service.
 */
export function sanitizeJourneyState(parsed: any): JourneyState {
  if (!parsed || typeof parsed !== 'object' || parsed.schemaVersion !== 1) {
    return createDefaultJourneyState();
  }

  const todayLocal = getLocalDateString();
  const focusThemes =
    Array.isArray(parsed.focusThemes) && parsed.focusThemes.length > 0
      ? parsed.focusThemes.filter((t: unknown) => typeof t === 'string')
      : ['din', 'afiyah'];

  const pace: 1 | 2 = parsed.pace === 2 ? 2 : 1;
  const reminderTime = typeof parsed.reminderTime === 'string' ? parsed.reminderTime : null;

  const completed: Record<string, { completedAt: string }> = {};
  if (parsed.completed && typeof parsed.completed === 'object') {
    for (const [k, v] of Object.entries(parsed.completed)) {
      if (v && typeof (v as any).completedAt === 'string') {
        completed[k] = { completedAt: (v as any).completedAt };
      }
    }
  }

  // Local-only private journal entries per stationId (never sent externally)
  const journal: Record<string, string> = {};
  if (parsed.journal && typeof parsed.journal === 'object') {
    for (const [k, v] of Object.entries(parsed.journal)) {
      if (typeof v === 'string' && v.trim().length > 0) {
        journal[k] = v;
      }
    }
  }

  // Local-only stage muhasaba answers per stageId (never sent externally)
  const muhasaba: Record<string, { q1: string; q2: string; completedAt?: string }> = {};
  if (parsed.muhasaba && typeof parsed.muhasaba === 'object') {
    for (const [k, v] of Object.entries(parsed.muhasaba)) {
      if (v && typeof v === 'object') {
        const q1 = typeof (v as any).q1 === 'string' ? (v as any).q1 : '';
        const q2 = typeof (v as any).q2 === 'string' ? (v as any).q2 : '';
        const completedAt =
          typeof (v as any).completedAt === 'string'
            ? (v as any).completedAt
            : new Date().toISOString();
        muhasaba[k] = { q1, q2, completedAt };
      }
    }
  }

  let stages: JourneyStage[] = [];
  if (Array.isArray(parsed.stages) && parsed.stages.length > 0) {
    stages = parsed.stages
      .filter((s: any) => s && typeof s.id === 'string' && Array.isArray(s.stationBlessingIds))
      .map((s: any) => {
        const stageId = String(s.id);
        const stationBlessingIds = s.stationBlessingIds.map((id: any) => String(id)).slice(0, 7);
        const stations: JourneyStation[] = stationBlessingIds.map((blessingId: string, idx: number) => {
          const stId = makeStationId(stageId, idx);
          return {
            id: stId,
            stageId,
            stationIndex: idx,
            blessingId,
            completedAt: completed[stId]?.completedAt,
            journalText: journal[stId]
          };
        });
        return {
          id: stageId,
          theme: String(s.theme || 'din'),
          title: String(s.title || 'منزل النعم'),
          stationBlessingIds,
          stations
        };
      });
  }
  if (stages.length === 0) {
    stages = buildStagesFromThemes(focusThemes).map((s) => ({
      ...s,
      stations: (s.stations || []).map((st) => ({
        ...st,
        completedAt: completed[st.id]?.completedAt,
        journalText: journal[st.id]
      }))
    }));
  }

  const allStations: JourneyStation[] = stages.flatMap((stage) =>
    (stage.stations || []).map((st) => ({
      ...st,
      completedAt: completed[st.id]?.completedAt,
      journalText: journal[st.id]
    }))
  );

  return {
    schemaVersion: 1,
    createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
    focusThemes,
    pace,
    reminderTime,
    stages,
    stations: allStations,
    completed,
    unlockedTodayCount:
      typeof parsed.unlockedTodayCount === 'number' ? Math.max(0, parsed.unlockedTodayCount) : 0,
    lastUnlockDate: typeof parsed.lastUnlockDate === 'string' ? parsed.lastUnlockDate : todayLocal,
    journal,
    muhasaba
  };
}

/**
 * Migration-safe loader for JourneyState from local device storage.
 * Falls back safely to defaults on missing or corrupt state.
 */
export function loadJourneyState(): JourneyState {
  try {
    const raw = localStorage.getItem(JOURNEY_STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultJourneyState();
      saveJourneyState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    const sanitized = sanitizeJourneyState(parsed);
    const synced = syncDailyUnlockWindow(sanitized);

    if (
      synced.lastUnlockDate !== sanitized.lastUnlockDate ||
      !parsed ||
      parsed.schemaVersion !== 1
    ) {
      saveJourneyState(synced);
    }
    return synced;
  } catch {
    const fallback = createDefaultJourneyState();
    saveJourneyState(fallback);
    return fallback;
  }
}

/**
 * Persists JourneyState strictly to localStorage on the user's device.
 * Reflective texts (`journal`, `muhasaba`) are never sent to any external server or analytics.
 */
export function saveJourneyState(state: JourneyState): void {
  try {
    const cleanState = sanitizeJourneyState(state);
    localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(cleanState));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(JOURNEY_UPDATED_EVENT, { detail: cleanState }));
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Checks whether the user has explicitly completed the 3-step Journey onboarding.
 */
export function hasCompletedJourneyOnboarding(): boolean {
  try {
    return localStorage.getItem(JOURNEY_ONBOARDED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Saves onboarding selections and constructs the personalized path while preserving any free-preview progress.
 */
export function completeJourneyOnboarding(params: {
  focusThemes: string[];
  pace: 1 | 2;
  reminderTime: string | null;
}): JourneyState {
  const existing = loadJourneyState();
  const stages = buildStagesFromThemes(params.focusThemes);
  const nextState = sanitizeJourneyState({
    ...existing,
    focusThemes: params.focusThemes,
    pace: params.pace,
    reminderTime: params.reminderTime,
    stages
  });
  try {
    localStorage.setItem(JOURNEY_ONBOARDED_KEY, 'true');
  } catch {}
  saveJourneyState(nextState);
  return nextState;
}

/**
 * Records station completion timestamp, increments unlockedTodayCount, and stores optional
 * private journal text strictly in local storage on the device.
 */
export function completeJourneyStation(params: {
  stationId: string;
  journalText?: string;
}): JourneyState {
  const current = syncDailyUnlockWindow(loadJourneyState());
  const alreadyCompleted = Boolean(current.completed[params.stationId]);

  const updatedCompleted = {
    ...current.completed,
    [params.stationId]: {
      completedAt: current.completed[params.stationId]?.completedAt || new Date().toISOString()
    }
  };

  const updatedJournal = { ...current.journal };
  if (typeof params.journalText === 'string') {
    const trimmed = params.journalText.trim();
    if (trimmed.length > 0) {
      updatedJournal[params.stationId] = trimmed;
    }
  }

  const nextState = sanitizeJourneyState({
    ...current,
    completed: updatedCompleted,
    journal: updatedJournal,
    unlockedTodayCount: alreadyCompleted
      ? current.unlockedTodayCount
      : current.unlockedTodayCount + 1,
    lastUnlockDate: getLocalDateString()
  });

  saveJourneyState(nextState);
  return nextState;
}

/**
 * Saves or updates a private journal reflection for a specific station locally on the device.
 * Never transmitted externally or to analytics.
 */
export function saveStationJournal(stationId: string, journalText: string): JourneyState {
  const current = loadJourneyState();
  const updatedJournal = { ...current.journal };
  const trimmed = journalText.trim();
  if (trimmed.length > 0) {
    updatedJournal[stationId] = trimmed;
  } else {
    delete updatedJournal[stationId];
  }
  const nextState = sanitizeJourneyState({
    ...current,
    journal: updatedJournal
  });
  saveJourneyState(nextState);
  return nextState;
}

/**
 * Saves the end-of-stage «وقفة محاسبة» answers (`q1`, `q2`) locally for a given stageId.
 * Stored strictly on the device (`localStorage`) and never transmitted externally.
 */
export function saveStageMuhasaba(stageId: string, q1: string = '', q2: string = ''): JourneyState {
  const current = loadJourneyState();
  const nextState = sanitizeJourneyState({
    ...current,
    muhasaba: {
      ...current.muhasaba,
      [stageId]: {
        q1: q1.trim(),
        q2: q2.trim(),
        completedAt: current.muhasaba[stageId]?.completedAt || new Date().toISOString()
      }
    }
  });
  saveJourneyState(nextState);
  return nextState;
}

/**
 * Checks if the user is returning after missing one or more days.
 * Never punishes or resets; only used to show the gentle welcome «الطريق ينتظرك، فلنكمل».
 */
export function hasMissedDaysRecently(state: JourneyState): boolean {
  const completedEntries = Object.values(state.completed);
  if (completedEntries.length === 0) return false;

  // Find latest completedAt timestamp
  let latestMs = 0;
  for (const item of completedEntries) {
    const ms = Date.parse(item.completedAt);
    if (!isNaN(ms) && ms > latestMs) {
      latestMs = ms;
    }
  }
  if (latestMs === 0) return false;

  const lastDate = new Date(latestMs);
  const lastLocalStr = getLocalDateString(lastDate);
  const todayLocalStr = getLocalDateString(new Date());

  if (lastLocalStr === todayLocalStr) return false;

  // Check yesterday's local string
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayLocalStr = getLocalDateString(yesterday);

  // If the last completed station was before yesterday, the user missed at least 1 day
  return lastLocalStr < yesterdayLocalStr;
}

/**
 * Developer utility: resets today's daily pacing lock so more stations can be tested immediately.
 */
export function devResetTodayPacingLock(): JourneyState {
  const current = loadJourneyState();
  const nextState: JourneyState = {
    ...current,
    unlockedTodayCount: 0,
    lastUnlockDate: getLocalDateString()
  };
  saveJourneyState(nextState);
  return nextState;
}

/**
 * Developer utility: resets the entire journey state & onboarding flag for fresh testing.
 */
export function devResetEntireJourney(): JourneyState {
  try {
    localStorage.removeItem(JOURNEY_STORAGE_KEY);
    localStorage.removeItem(JOURNEY_ONBOARDED_KEY);
  } catch {}
  const fresh = createDefaultJourneyState();
  saveJourneyState(fresh);
  return fresh;
}
