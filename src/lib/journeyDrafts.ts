/**
 * Unsaved text in «رحلتي»: what the user has typed in a station's note or in an
 * end-of-stage review but not yet saved. Without this, closing the screen or
 * moving to another station discarded it without warning.
 *
 * Drafts stay on the device, like everything else the user writes, and are
 * removed as soon as the text is saved.
 */
export const JOURNEY_DRAFTS_KEY = 'alhamd:journey_drafts:v1';

interface MuhasabaDraft {
  q1: string;
  q2: string;
}

interface JourneyDrafts {
  stations: Record<string, string>;
  muhasaba: Record<string, MuhasabaDraft>;
}

function readDrafts(): JourneyDrafts {
  try {
    const raw = localStorage.getItem(JOURNEY_DRAFTS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      stations: parsed && typeof parsed.stations === 'object' && parsed.stations ? parsed.stations : {},
      muhasaba: parsed && typeof parsed.muhasaba === 'object' && parsed.muhasaba ? parsed.muhasaba : {}
    };
  } catch {
    return { stations: {}, muhasaba: {} };
  }
}

function writeDrafts(drafts: JourneyDrafts): void {
  try {
    const isEmpty =
      Object.keys(drafts.stations).length === 0 && Object.keys(drafts.muhasaba).length === 0;
    if (isEmpty) {
      localStorage.removeItem(JOURNEY_DRAFTS_KEY);
    } else {
      localStorage.setItem(JOURNEY_DRAFTS_KEY, JSON.stringify(drafts));
    }
  } catch {
    // Storage unavailable or full: the draft simply is not kept.
  }
}

/** The unsaved note for a station, or undefined when there is none. */
export function getStationDraft(stationId: string): string | undefined {
  const draft = readDrafts().stations[stationId];
  return typeof draft === 'string' ? draft : undefined;
}

/** Keeps the text as typed. Used on every change, so an empty string is a draft too: the user cleared the note. */
export function setStationDraft(stationId: string, text: string): void {
  const drafts = readDrafts();
  drafts.stations[stationId] = text;
  writeDrafts(drafts);
}

export function clearStationDraft(stationId: string): void {
  const drafts = readDrafts();
  if (!(stationId in drafts.stations)) return;
  delete drafts.stations[stationId];
  writeDrafts(drafts);
}

/** The unsaved answers of a stage's review, or undefined when there are none. */
export function getMuhasabaDraft(stageId: string): MuhasabaDraft | undefined {
  const draft = readDrafts().muhasaba[stageId];
  if (!draft || typeof draft !== 'object') return undefined;
  return {
    q1: typeof draft.q1 === 'string' ? draft.q1 : '',
    q2: typeof draft.q2 === 'string' ? draft.q2 : ''
  };
}

export function setMuhasabaDraft(stageId: string, q1: string, q2: string): void {
  const drafts = readDrafts();
  drafts.muhasaba[stageId] = { q1, q2 };
  writeDrafts(drafts);
}

export function clearMuhasabaDraft(stageId: string): void {
  const drafts = readDrafts();
  if (!(stageId in drafts.muhasaba)) return;
  delete drafts.muhasaba[stageId];
  writeDrafts(drafts);
}

/** Removes every draft; used when the whole journey is reset. */
export function clearAllJourneyDrafts(): void {
  try {
    localStorage.removeItem(JOURNEY_DRAFTS_KEY);
  } catch {
    // Ignore storage errors
  }
}
