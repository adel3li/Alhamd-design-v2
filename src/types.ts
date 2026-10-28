export interface QuranReference {
  textUthmani: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  verified: boolean;
}

export interface HadithReference {
  text: string;
  source: string;
  number: string;
  grade: string;
  gradeVerified: boolean;
}

export interface ScholarQuote {
  text: string;
  scholar: string;
  work: string;
  attributionType: string;
  verifiedVerbatim: boolean;
}

export type IstisharStepType = 'ground' | 'visualize' | 'deepen' | 'return' | 'hamd';

export interface IstisharStep {
  step: number;
  type: IstisharStepType;
  text: string;
  durationSec: number;
}

export interface Blessing {
  id: string;
  order: number;
  category: string;
  categoryLabel: string;
  title: string;
  shortTitle: string;
  openingLine: string;
  quran: QuranReference;
  hadith: HadithReference;
  scholarQuote: ScholarQuote;
  istisharSteps: IstisharStep[];
  tadabbur: string;
  duaa: string;
  journalPrompt: string;
  relatedPodcastEpisode: string;
  reviewStatus: string;
  reviewedBy: string;
  reviewDate: string | null;
  contentVersion: number;
}

export interface BlessingsData {
  schemaVersion: number;
  contentNote: string;
  blessings: Blessing[];
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD or ISO timestamp
  displayDate?: string; // Hijri formatted date for display
  blessingId: string;
  shortTitle: string;
  categoryLabel: string;
  text: string;
  createdAt: number; // timestamp
}

export interface UserBlessing {
  id: string;
  title: string; // "ما النعمة؟"
  prompt1?: string; // "متى شعرت بهذه النعمة آخر مرة؟"
  prompt2?: string; // "تخيل أسبوعا كاملا بلا هذه النعمة... ماذا يتغير؟"
  prompt3?: string; // "بكلماتك أنت: علام تحمد الله الآن؟"
  body?: string; // legacy support or compiled reflection
  valueReflection?: string; // legacy support
  category: string; // One of the 8 categories
  isFavorite: boolean;
  source: 'user';
  createdAt: number;
  updatedAt: number;
}

export interface InspirationItem {
  type: 'quran' | 'hadith';
  text: string;
  source: string;
}

export interface DhikrItem {
  text: string;
  virtue?: string;
}

export type ThemeMode = 'dark' | 'light' | 'auto';
export type TextSize = 'normal' | 'large' | 'xlarge';
export type DisplayFontFamily = 'ibm' | 'noto-naskh' | 'amiri' | 'tajawal';

/**
 * Individual station definition within a JourneyStage in «رحلتي» (Personal Journey).
 * References an existing blessing by ID and tracks local completion and private journal reflection.
 */
export interface JourneyStation {
  id: string;
  stageId: string;
  stationIndex: number; // 0..6
  blessingId: string;   // references existing blessing id
  completedAt?: string; // ISO timestamp when completed
  journalText?: string; // Private reflection stored locally on device only, never sent externally
}

/**
 * Stage definition within «رحلتي» (Personal Journey).
 * References existing blessings strictly by ID without reordering the pool.
 */
export interface JourneyStage {
  id: string;
  theme: string;
  title: string;
  stationBlessingIds: string[]; // references existing blessing ids (7 stations per stage)
  stations?: JourneyStation[];
}

/**
 * Local storage state for «رحلتي» (Personal Journey).
 * Privacy policy: Reflective texts (`journal` and `muhasaba`) are stored strictly on the local device
 * (`localStorage`) and are NEVER transmitted to any external party or analytics service.
 */
export type JourneyState = {
  schemaVersion: 1;
  createdAt: string;            // ISO timestamp
  focusThemes: string[];
  pace: 1 | 2;
  reminderTime: string | null;  // "HH:mm"
  stages: JourneyStage[];
  stations: JourneyStation[];   // All stations across stages hydrated with local progress & private journal
  completed: Record<string, { completedAt: string }>; // key: stationId
  unlockedTodayCount: number;
  lastUnlockDate: string;       // "YYYY-MM-DD", local date
  journal: Record<string, string>;       // stationId -> private text (local device only, never sent externally)
  muhasaba: Record<string, { q1: string; q2: string; completedAt?: string }>; // stageId -> answers (local device only)
};

export interface AppState {
  onboardingComplete: boolean;
  journalEntries: JournalEntry[];
  userBlessings: UserBlessing[];
  completedReflections: string[]; // ISO dates yyyy-mm-dd
  journeyState: JourneyState;
  notificationTime: string; // "07:00"
  notificationsEnabled: boolean;
  theme: ThemeMode;
  highContrast: boolean;
  nightReadingMode: boolean;
  fontFamily: DisplayFontFamily;
  textSize: TextSize;
  fontSize: number; // Numeric root font size in px (range 12 - 24, default 15)
  firstLaunchDate: string | null;
  welcomeSeen: boolean;
  analyticsConsent: boolean | null;
  tourCompleted: boolean;
  tasbihCount: number;
}

export interface StoreContextType extends AppState {
  onboardingCompleted: boolean;
  todayBlessing: Blessing;
  todayInspiration: InspirationItem;
  entries: JournalEntry[];
  completedDays: string[];
  isCompletedToday: boolean;
  completeOnboarding: () => void;
  markWelcomeSeen: () => void;
  completeTour: () => void;
  replayTour: () => void;
  setAnalyticsConsent: (consent: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setHighContrast: (enabled: boolean) => void;
  setNightReadingMode: (enabled: boolean) => void;
  setFontFamily: (font: DisplayFontFamily) => void;
  setTextSize: (size: TextSize) => void;
  setFontSize: (size: number) => void;
  setNotificationTime: (time: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  updateJourneyState: (updater: JourneyState | ((prev: JourneyState) => JourneyState)) => void;
  completeJourneyOnboardingState: (params: { focusThemes: string[]; pace: 1 | 2; reminderTime: string | null }) => JourneyState;
  completeJourneyStationState: (params: { stationId: string; journalText?: string }) => JourneyState;
  saveJourneyStationJournal: (stationId: string, journalText: string) => JourneyState;
  saveJourneyStageMuhasaba: (stageId: string, q1: string, q2: string) => JourneyState;
  resetJourneyState: () => JourneyState;
  addJournalEntry: (entry: string | { blessingId?: string; shortTitle?: string; categoryLabel?: string; text: string; date?: string }) => JournalEntry;
  deleteJournalEntry: (id: string) => void;
  addUserBlessing: (data: { title: string; prompt1?: string; prompt2?: string; prompt3?: string; category: string; isFavorite?: boolean }) => UserBlessing;
  updateUserBlessing: (id: string, patch: Partial<UserBlessing>) => void;
  deleteUserBlessing: (id: string) => void;
  toggleFavoriteUserBlessing: (id: string) => void;
  markReflectionCompleted: (isoDate?: string) => void;
  markTodayCompleted: (isoDate?: string) => void;
  isReflectionCompletedToday: () => boolean;
  incrementTasbih: () => void;
  resetTasbih: () => void;
  exportBackupJSON: () => string;
  importBackupJSON: (jsonStr: string) => { success: boolean; message: string };
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success') => void;
}

export interface BackupPayloadV2 {
  version: 2;
  exportedAt: string;
  settings: {
    theme: ThemeMode;
    highContrast?: boolean;
    nightReadingMode?: boolean;
    fontFamily?: DisplayFontFamily;
    textSize: TextSize;
    fontSize?: number;
    notificationTime: string;
    notificationsEnabled: boolean;
    onboardingComplete: boolean;
    welcomeSeen: boolean;
  };
  journal: JournalEntry[];
  completedDays: string[];
  personalBlessings: UserBlessing[];
  journeyState?: JourneyState;
}
