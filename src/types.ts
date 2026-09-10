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

export interface AppState {
  onboardingComplete: boolean;
  journalEntries: JournalEntry[];
  userBlessings: UserBlessing[];
  completedReflections: string[]; // ISO dates yyyy-mm-dd
  notificationTime: string; // "07:00"
  notificationsEnabled: boolean;
  theme: ThemeMode;
  textSize: TextSize;
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
  setTextSize: (size: TextSize) => void;
  setNotificationTime: (time: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
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
    textSize: TextSize;
    notificationTime: string;
    notificationsEnabled: boolean;
    onboardingComplete: boolean;
    welcomeSeen: boolean;
  };
  journal: JournalEntry[];
  completedDays: string[];
  personalBlessings: UserBlessing[];
}
