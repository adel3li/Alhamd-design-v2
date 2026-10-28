import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import {
  AppState,
  StoreContextType,
  JournalEntry,
  UserBlessing,
  ThemeMode,
  TextSize,
  DisplayFontFamily,
  BackupPayloadV2
} from '../types';
import { mapOldCategoryToCanonical } from '../constants/categories';
import { getAllBlessings } from '../data/loader';
import { resolveTodayExperience, getDayNumber, getTodayInspiration } from './dailyLogic';
import {
  loadJourneyState,
  saveJourneyState,
  sanitizeJourneyState,
  completeJourneyOnboarding,
  completeJourneyStation,
  saveStationJournal,
  saveStageMuhasaba,
  devResetEntireJourney,
  JOURNEY_UPDATED_EVENT
} from './journeyStore';

export interface JourneyStation {
  id: string;
  stageId: string;
  stageIndex?: number;
  stationIndex: number;
  blessingId: string;
  completed?: boolean;
  completedAt?: string;
  journalText?: string;
}

export interface JourneyStage {
  id: string;
  theme: string;
  title: string;
  intention?: string;
  stationBlessingIds: string[]; // references existing blessing ids
  stations?: JourneyStation[];
}

export interface JourneyState {
  schemaVersion: 1;
  createdAt: string; // ISO
  focusThemes: string[];
  pace: 1 | 2;
  reminderTime: string | null; // "HH:mm"
  stages: JourneyStage[];
  stations: JourneyStation[];
  completed: Record<string, { completedAt: string }>; // key: stationId
  unlockedTodayCount: number;
  lastUnlockDate: string; // "YYYY-MM-DD", local date
  journal: Record<string, string>; // stationId -> private text (local-only, never sent externally)
  muhasaba: Record<string, { q1: string; q2: string; completedAt?: string }>; // stageId -> answers (local-only)
}

const STORAGE_KEYS = {
  STATE: 'alhamd_state',
  USER_BLESSINGS: 'alhamd:userBlessings:v1',
  ONBOARDED: 'alhamd_onboarded',
  TOUR: 'alhamd:tourComplete',
  CONSENT: 'alhamd:analytics_consent',
  JOURNEY: 'alhamd:journey_state:v1'
};

const initialSampleJournal: JournalEntry[] = [
  {
    id: 'sample_entry_1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    displayDate: 'الأحد ٢٥ ذو الحجة',
    blessingId: 'blessing_022',
    shortTitle: 'الأم',
    categoryLabel: 'نعم الأهل',
    text: 'اتصلتُ بها اليوم لأشكرها فقط، فدعت لي دعوةً أذابت قلبي.',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'sample_entry_2',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    displayDate: 'السبت ٢٤ ذو الحجة',
    blessingId: 'blessing_015',
    shortTitle: 'الماء',
    categoryLabel: 'نعم الحياة والنفس',
    text: 'انقطع الماء عن حيّنا ساعتين، فذقتُ معنى النعمة حين غابت.',
    createdAt: Date.now() - 172800000
  }
];

const initialSampleBlessings: UserBlessing[] = [
  {
    id: 'sample_user_blessing_1',
    title: 'صوت المطر على نافذتي',
    prompt1: 'الليلة الماضية حين انهمر المطر في هدوء الليل.',
    prompt2: 'جفاف الأرض وصمت الطبيعة وغياب رائحة الغيث التي تشرح الصدر.',
    prompt3: 'الحمد لله الذي يسوق السحاب رحمةً وينزل الغيث من بعد ما قنطوا.',
    category: 'نعم الحياة والنفس',
    isFavorite: true,
    source: 'user',
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000
  }
];

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from storage
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  });

  const [welcomeSeen, setWelcomeSeen] = useState<boolean>(() => {
    return localStorage.getItem('alhamd_welcome_seen') === 'true';
  });

  const [tourCompleted, setTourCompleted] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOUR) === 'true';
  });

  const [analyticsConsent, setAnalyticsConsentState] = useState<boolean | null>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.CONSENT);
    return val === null ? null : val === 'true';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    localStorage.removeItem('alhamd_theme');
    const saved = localStorage.getItem('alhamd_theme_v2') as ThemeMode | null;
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('alhamd_high_contrast') === 'true';
  });

  const [nightReadingMode, setNightReadingModeState] = useState<boolean>(() => {
    return localStorage.getItem('alhamd_night_reading') === 'true';
  });

  const [fontFamily, setFontFamilyState] = useState<DisplayFontFamily>(() => {
    const saved = localStorage.getItem('alhamd_font_family') as DisplayFontFamily | null;
    if (saved === 'ibm' || saved === 'noto-naskh' || saved === 'amiri' || saved === 'tajawal') {
      return saved;
    }
    return 'ibm';
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    return (localStorage.getItem('alhamd_text_size') as TextSize) || 'normal';
  });

  const [fontSize, setFontSizeState] = useState<number>(() => {
    const saved = localStorage.getItem('alhamd_font_size_v2');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 12 && parsed <= 24) {
        return parsed;
      }
    }
    return 16;
  });

  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    const val = localStorage.getItem('alhamd_notif_enabled');
    return val !== 'false';
  });

  const [notificationTime, setNotificationTimeState] = useState<string>(() => {
    return localStorage.getItem('alhamd_notif_time') || '21:00';
  });

  const [completedReflections, setCompletedReflections] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('alhamd_completed_reflections');
      if (stored) return JSON.parse(stored);
    } catch {}
    // Default with past 3 days completed for warm rich experience
    const today = new Date();
    const d1 = new Date(today); d1.setDate(today.getDate() - 1);
    const d2 = new Date(today); d2.setDate(today.getDate() - 2);
    const d3 = new Date(today); d3.setDate(today.getDate() - 4);
    return [
      d1.toISOString().split('T')[0],
      d2.toISOString().split('T')[0],
      d3.toISOString().split('T')[0]
    ];
  });

  // Journey state (themes, pace, stage/station progress, and private journals stored strictly on local device)
  const [journeyState, setJourneyStateInternal] = useState<JourneyState>(() => {
    return loadJourneyState();
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const stored = localStorage.getItem('alhamd_journal');
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialSampleJournal;
  });

  const [userBlessings, setUserBlessings] = useState<UserBlessing[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_BLESSINGS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialSampleBlessings;
  });

  const [tasbihCount, setTasbihCount] = useState<number>(() => {
    const val = localStorage.getItem('alhamd_tasbih_count');
    return val ? parseInt(val, 10) : 0;
  });

  // Ensure journeyState is persisted locally whenever it updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNEY, JSON.stringify(journeyState));
    } catch {
      // Ignore storage quota errors
    }
  }, [journeyState]);

  // Listen for JourneyState updates from journeyStore helpers
  useEffect(() => {
    const handleJourneyUpdated = () => {
      const latest = loadJourneyState();
      setJourneyStateInternal((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(latest)) return prev;
        return latest;
      });
    };
    window.addEventListener(JOURNEY_UPDATED_EVENT, handleJourneyUpdated);
    return () => {
      window.removeEventListener(JOURNEY_UPDATED_EVENT, handleJourneyUpdated);
    };
  }, []);

  // Persist journeyState changes locally on the device only (never sent externally)
  const updateJourneyState = useCallback(
    (updater: JourneyState | ((prev: JourneyState) => JourneyState)) => {
      setJourneyStateInternal((prev) => {
        const nextRaw = typeof updater === 'function' ? updater(prev) : updater;
        const sanitized = sanitizeJourneyState(nextRaw);
        saveJourneyState(sanitized);
        return sanitized;
      });
    },
    []
  );

  const completeJourneyOnboardingState = useCallback(
    (params: { focusThemes: string[]; pace: 1 | 2; reminderTime: string | null }): JourneyState => {
      const next = completeJourneyOnboarding(params);
      setJourneyStateInternal(next);
      return next;
    },
    []
  );

  const completeJourneyStationState = useCallback(
    (params: { stationId: string; journalText?: string }): JourneyState => {
      const next = completeJourneyStation(params);
      setJourneyStateInternal(next);
      return next;
    },
    []
  );

  const saveJourneyStationJournal = useCallback(
    (stationId: string, journalText: string): JourneyState => {
      const next = saveStationJournal(stationId, journalText);
      setJourneyStateInternal(next);
      return next;
    },
    []
  );

  const saveJourneyStageMuhasaba = useCallback(
    (stageId: string, q1: string, q2: string): JourneyState => {
      const next = saveStageMuhasaba(stageId, q1, q2);
      setJourneyStateInternal(next);
      return next;
    },
    []
  );

  const resetJourneyState = useCallback((): JourneyState => {
    const fresh = devResetEntireJourney();
    setJourneyStateInternal(fresh);
    return fresh;
  }, []);

  // Blessings pool and Today's computed blessing
  const allBlessings = useMemo(() => getAllBlessings(), []);
  const todayExp = useMemo(() => {
    return resolveTodayExperience(new Date(), welcomeSeen, allBlessings);
  }, [welcomeSeen, allBlessings]);
  const todayBlessing = todayExp.blessing;

  // Today's computed inspiration (Ayah or Hadith)
  const todayInspiration = useMemo(() => {
    const dayNum = getDayNumber(new Date());
    return getTodayInspiration(dayNum);
  }, []);

  // Today's reflection completion state
  const isCompletedToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return completedReflections.includes(todayStr);
  }, [completedReflections]);

  // Haptic Feedback Helper
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === 'light') navigator.vibrate(8);
        else if (type === 'medium') navigator.vibrate(20);
        else if (type === 'heavy') navigator.vibrate(35);
        else if (type === 'success') navigator.vibrate([15, 30, 25]);
      } catch {}
    }
  }, []);

  // Synchronize with document element classes for Theme & High Contrast
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark', 'theme-dark');
      root.classList.add('light', 'theme-light');
    } else {
      root.classList.remove('light', 'theme-light');
      root.classList.add('dark', 'theme-dark');
    }
    localStorage.setItem('alhamd_theme_v2', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('alhamd_high_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('night-reading', nightReadingMode);
    localStorage.setItem('alhamd_night_reading', String(nightReadingMode));
  }, [nightReadingMode]);

  // Synchronize Display Font Family for long-form reading comfort
  useEffect(() => {
    const root = document.documentElement;
    const fontStackMap: Record<DisplayFontFamily, string> = {
      ibm: "'IBM Plex Sans Arabic', sans-serif",
      'noto-naskh': "'Noto Naskh Arabic', 'Amiri', serif",
      amiri: "'Amiri', serif",
      tajawal: "'Tajawal', 'IBM Plex Sans Arabic', sans-serif"
    };
    const selectedStack = fontStackMap[fontFamily] || fontStackMap.ibm;
    root.style.setProperty('--font-sans', selectedStack);
    root.setAttribute('data-font-family', fontFamily);
    localStorage.setItem('alhamd_font_family', fontFamily);
  }, [fontFamily]);

  // Synchronize numeric Font Size & legacy Text Size class
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-font-size', `${fontSize}px`);
    root.style.fontSize = `${fontSize}px`;
    localStorage.setItem('alhamd_font_size_v2', String(fontSize));

    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    const derivedSize: TextSize = fontSize >= 20 ? 'xlarge' : fontSize >= 18 ? 'large' : 'normal';
    root.classList.add(`text-size-${derivedSize}`);
    localStorage.setItem('alhamd_text_size', derivedSize);
  }, [fontSize]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('alhamd_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_BLESSINGS, JSON.stringify(userBlessings));
  }, [userBlessings]);

  useEffect(() => {
    localStorage.setItem('alhamd_completed_reflections', JSON.stringify(completedReflections));
  }, [completedReflections]);

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true);
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
    triggerHaptic('success');
  }, [triggerHaptic]);

  const markWelcomeSeen = useCallback(() => {
    setWelcomeSeen(true);
    localStorage.setItem('alhamd_welcome_seen', 'true');
  }, []);

  const completeTour = useCallback(() => {
    setTourCompleted(true);
    localStorage.setItem(STORAGE_KEYS.TOUR, 'true');
  }, []);

  const replayTour = useCallback(() => {
    setTourCompleted(false);
    localStorage.removeItem(STORAGE_KEYS.TOUR);
  }, []);

  const setAnalyticsConsent = useCallback((consent: boolean) => {
    setAnalyticsConsentState(consent);
    localStorage.setItem(STORAGE_KEYS.CONSENT, String(consent));
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (newTheme === 'light') {
      setNightReadingModeState(false);
    }
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    setHighContrastState(enabled);
    if (enabled) {
      setNightReadingModeState(false);
    }
  }, []);

  const setNightReadingMode = useCallback((enabled: boolean) => {
    setNightReadingModeState(enabled);
    if (enabled) {
      setThemeState('dark');
      setHighContrastState(false);
    }
  }, []);

  const setFontFamily = useCallback((font: DisplayFontFamily) => {
    setFontFamilyState(font);
  }, []);

  const setFontSize = useCallback((size: number) => {
    const clamped = Math.min(24, Math.max(12, Math.round(size * 2) / 2));
    setFontSizeState(clamped);
    const derivedSize: TextSize = clamped >= 20 ? 'xlarge' : clamped >= 18 ? 'large' : 'normal';
    setTextSizeState(derivedSize);
  }, []);

  const setTextSize = useCallback((size: TextSize) => {
    setTextSizeState(size);
    if (size === 'normal') setFontSizeState(16);
    else if (size === 'large') setFontSizeState(18);
    else if (size === 'xlarge') setFontSizeState(20);
  }, []);

  const setNotificationTime = useCallback((time: string) => {
    setNotificationTimeState(time);
    localStorage.setItem('alhamd_notif_time', time);
  }, []);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    localStorage.setItem('alhamd_notif_enabled', String(enabled));
    triggerHaptic('light');
  }, [triggerHaptic]);

  const addJournalEntry = useCallback((entry: string | { blessingId?: string; shortTitle?: string; categoryLabel?: string; text: string; date?: string }) => {
    const now = new Date();
    const isoDate = typeof entry === 'object' && entry.date ? entry.date : now.toISOString().split('T')[0];
    
    // Arabic formatted date
    let displayDate = 'اليوم';
    try {
      const dayFormatter = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' });
      const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long' });
      displayDate = `${dayFormatter.format(now)} ${hijriFormatter.format(now)}`;
    } catch {}

    const textContent = typeof entry === 'string' ? entry : entry.text;
    const blessingId = typeof entry === 'object' && entry.blessingId ? entry.blessingId : todayBlessing.id;
    const shortTitle = typeof entry === 'object' && entry.shortTitle ? entry.shortTitle : todayBlessing.shortTitle;
    const categoryLabel = typeof entry === 'object' && entry.categoryLabel ? entry.categoryLabel : todayBlessing.categoryLabel;

    const newEntry: JournalEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      date: isoDate,
      displayDate,
      blessingId,
      shortTitle,
      categoryLabel,
      text: textContent,
      createdAt: Date.now()
    };

    setJournalEntries(prev => [newEntry, ...prev]);
    triggerHaptic('success');
    return newEntry;
  }, [todayBlessing, triggerHaptic]);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
    triggerHaptic('medium');
  }, [triggerHaptic]);

  const addUserBlessing = useCallback((data: { title: string; prompt1?: string; prompt2?: string; prompt3?: string; category: string; isFavorite?: boolean }) => {
    const newBlessing: UserBlessing = {
      id: 'user_blessing_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: data.title,
      prompt1: data.prompt1 || '',
      prompt2: data.prompt2 || '',
      prompt3: data.prompt3 || '',
      body: data.prompt3 || data.title,
      category: data.category,
      isFavorite: !!data.isFavorite,
      source: 'user',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setUserBlessings(prev => [newBlessing, ...prev]);
    triggerHaptic('success');
    return newBlessing;
  }, [triggerHaptic]);

  const updateUserBlessing = useCallback((id: string, patch: Partial<UserBlessing>) => {
    setUserBlessings(prev => prev.map(b => b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b));
    triggerHaptic('light');
  }, [triggerHaptic]);

  const deleteUserBlessing = useCallback((id: string) => {
    setUserBlessings(prev => prev.filter(b => b.id !== id));
    triggerHaptic('medium');
  }, [triggerHaptic]);

  const toggleFavoriteUserBlessing = useCallback((id: string) => {
    setUserBlessings(prev => prev.map(b => b.id === id ? { ...b, isFavorite: !b.isFavorite } : b));
    triggerHaptic('light');
  }, [triggerHaptic]);

  const markReflectionCompleted = useCallback((isoDate?: string) => {
    const targetDate = isoDate || new Date().toISOString().split('T')[0];
    setCompletedReflections(prev => {
      if (prev.includes(targetDate)) return prev;
      return [targetDate, ...prev];
    });
    triggerHaptic('success');
  }, [triggerHaptic]);

  const isReflectionCompletedToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return completedReflections.includes(today);
  }, [completedReflections]);

  const incrementTasbih = useCallback(() => {
    setTasbihCount(c => {
      const next = c + 1;
      localStorage.setItem('alhamd_tasbih_count', String(next));
      if (next % 33 === 0) {
        triggerHaptic('heavy');
      } else {
        triggerHaptic('light');
      }
      return next;
    });
  }, [triggerHaptic]);

  const resetTasbih = useCallback(() => {
    setTasbihCount(0);
    localStorage.setItem('alhamd_tasbih_count', '0');
    triggerHaptic('medium');
  }, [triggerHaptic]);

  const exportBackupJSON = useCallback((): string => {
    const payload: BackupPayloadV2 = {
      version: 2,
      exportedAt: new Date().toISOString(),
      settings: {
        theme,
        highContrast,
        nightReadingMode,
        fontFamily,
        textSize,
        fontSize,
        notificationTime,
        notificationsEnabled,
        onboardingComplete,
        welcomeSeen
      },
      journal: journalEntries,
      completedDays: completedReflections,
      personalBlessings: userBlessings,
      journeyState: sanitizeJourneyState(journeyState)
    };
    return JSON.stringify(payload, null, 2);
  }, [theme, highContrast, nightReadingMode, fontFamily, textSize, fontSize, notificationTime, notificationsEnabled, onboardingComplete, welcomeSeen, journalEntries, completedReflections, userBlessings, journeyState]);

  const importBackupJSON = useCallback((jsonStr: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.version === 2) {
        // v2 format
        if (data.journal && Array.isArray(data.journal)) {
          setJournalEntries(data.journal);
        }
        if (data.completedDays && Array.isArray(data.completedDays)) {
          setCompletedReflections(data.completedDays);
        }
        if (data.personalBlessings && Array.isArray(data.personalBlessings)) {
          setUserBlessings(data.personalBlessings);
        }
        if (data.journeyState && typeof data.journeyState === 'object') {
          const cleanJourney = sanitizeJourneyState(data.journeyState);
          saveJourneyState(cleanJourney);
          setJourneyStateInternal(cleanJourney);
        }
        if (data.settings) {
          if (data.settings.theme) setThemeState(data.settings.theme);
          if (typeof data.settings.highContrast === 'boolean') setHighContrastState(data.settings.highContrast);
          if (typeof data.settings.nightReadingMode === 'boolean') setNightReadingModeState(data.settings.nightReadingMode);
          if (data.settings.fontFamily) setFontFamilyState(data.settings.fontFamily);
          if (data.settings.textSize) setTextSizeState(data.settings.textSize);
          if (typeof data.settings.fontSize === 'number') setFontSizeState(data.settings.fontSize);
          if (data.settings.notificationTime) setNotificationTimeState(data.settings.notificationTime);
        }
        return { success: true, message: 'تم استرجاع بياناتك بنجاح.' };
      } else if (data.state || data.userBlessings) {
        // Legacy v1 format migration
        const oldState = data.state || {};
        if (oldState.journalEntries && Array.isArray(oldState.journalEntries)) {
          const mappedJournal: JournalEntry[] = oldState.journalEntries.map((entry: any) => ({
            id: entry.id || String(Date.now()),
            date: entry.date && entry.date.includes('-') ? entry.date : new Date().toISOString().split('T')[0],
            displayDate: entry.date,
            blessingId: entry.blessingId || 'islam',
            shortTitle: entry.shortTitle || entry.blessingTitle || 'نعمة',
            categoryLabel: mapOldCategoryToCanonical(entry.categoryLabel || entry.category),
            text: entry.text || '',
            createdAt: Date.now()
          }));
          setJournalEntries(mappedJournal);
        }

        if (oldState.completedReflections && Array.isArray(oldState.completedReflections)) {
          setCompletedReflections(oldState.completedReflections);
        }

        if (data.userBlessings && Array.isArray(data.userBlessings)) {
          const mappedBlessings: UserBlessing[] = data.userBlessings.map((b: any) => ({
            id: b.id || String(Date.now()),
            title: b.title || 'نعمة شخصية',
            prompt1: '',
            prompt2: b.valueReflection || '',
            prompt3: b.body || '',
            body: b.body || '',
            category: mapOldCategoryToCanonical(b.category),
            isFavorite: !!b.isFavorite,
            source: 'user',
            createdAt: b.createdAt || Date.now(),
            updatedAt: b.updatedAt || Date.now()
          }));
          setUserBlessings(mappedBlessings);
        }

        return { success: true, message: 'تم استرجاع النسخة الاحتياطية وترقيتها بنجاح.' };
      }
      return { success: false, message: 'ملف النسخة الاحتياطية غير متوافق.' };
    } catch {
      return { success: false, message: 'تعذر قراءة ملف النسخة الاحتياطية.' };
    }
  }, []);

  return (
    <StoreContext.Provider
      value={{
        onboardingComplete,
        onboardingCompleted: onboardingComplete,
        todayBlessing,
        todayInspiration,
        entries: journalEntries,
        journalEntries,
        userBlessings,
        completedDays: completedReflections,
        completedReflections,
        journeyState,
        isCompletedToday,
        notificationTime,
        notificationsEnabled,
        theme,
        highContrast,
        nightReadingMode,
        fontFamily,
        textSize,
        fontSize,
        firstLaunchDate: null,
        welcomeSeen,
        analyticsConsent,
        tourCompleted,
        tasbihCount,
        completeOnboarding,
        markWelcomeSeen,
        completeTour,
        replayTour,
        setAnalyticsConsent,
        setTheme,
        setHighContrast,
        setNightReadingMode,
        setFontFamily,
        setTextSize,
        setFontSize,
        setNotificationTime,
        setNotificationsEnabled,
        updateJourneyState,
        completeJourneyOnboardingState,
        completeJourneyStationState,
        saveJourneyStationJournal,
        saveJourneyStageMuhasaba,
        resetJourneyState,
        addJournalEntry,
        deleteJournalEntry,
        addUserBlessing,
        updateUserBlessing,
        deleteUserBlessing,
        toggleFavoriteUserBlessing,
        markReflectionCompleted,
        markTodayCompleted: markReflectionCompleted,
        isReflectionCompletedToday,
        incrementTasbih,
        resetTasbih,
        exportBackupJSON,
        importBackupJSON,
        triggerHaptic
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
