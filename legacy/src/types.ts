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

export interface IstisharStep {
  step: number;
  type: 'ground' | 'visualize' | 'deepen' | 'return' | 'hamd';
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
  date: string;
  blessingId: string;
  shortTitle: string;
  categoryLabel: string;
  text: string;
  // Keep old fields optional for backwards compatibility
  blessingTitle?: string;
  category?: string;
}

export interface AppState {
  onboardingComplete: boolean;
  journalEntries: JournalEntry[];
  completedReflections: string[]; // array of ISO dates yyyy-mm-dd
  notificationTime: string;
  theme: 'light' | 'dark' | 'auto';
  textSize: 'normal' | 'large';
  firstLaunchDate: string | null;
  welcomeSeen: boolean;
  hapticReminders: boolean;
  notificationsEnabled: boolean;
  tasbihCount: number;
}

