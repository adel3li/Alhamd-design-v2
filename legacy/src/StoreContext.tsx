import React, { createContext, useContext, useState, useEffect } from "react";
import { AppState, JournalEntry } from "./types";
import { storage } from "./services/storage";

const defaultState: AppState = {
  onboardingComplete: false,
  journalEntries: [],
  completedReflections: [],
  notificationTime: "07:00",
  theme: "dark",
  textSize: "normal",
  firstLaunchDate: null,
  welcomeSeen: false,
  hapticReminders: false,
  notificationsEnabled: false,
  tasbihCount: 0
};

interface StoreContextType {
  state: AppState;
  completeOnboarding: (time: string) => void;
  saveJournalEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (id: string) => void;
  markReflectionComplete: (date: string) => void;
  updateSettings: (settings: Partial<AppState>) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    const loadStore = async () => {
      const saved = await storage.getItem("alhamd_state");
      if (saved) {
        let parsed = JSON.parse(saved);
        if (!parsed.dark_mode_forced_v1) {
          parsed.theme = 'dark';
          parsed.dark_mode_forced_v1 = true;
        }
        setState({ ...defaultState, ...parsed });
      } else {
        setState(defaultState);
      }
    };
    loadStore();
  }, []);

  useEffect(() => {
    if (!state) return;
    const stateToSave = { ...state, dark_mode_forced_v1: true };
    storage.setItem("alhamd_state", JSON.stringify(stateToSave));
    // Apply theme
    if (state.theme === 'dark' || (state.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // Apply text size
    if (state.textSize === 'large') {
      document.documentElement.classList.add('text-size-large');
    } else {
      document.documentElement.classList.remove('text-size-large');
    }
  }, [state]);

  const completeOnboarding = (time: string) => {
    if (!state) return;
    setState(s => s ? ({ ...s, onboardingComplete: true, notificationTime: time }) : null);
  };

  const saveJournalEntry = (entry: JournalEntry) => {
    if (!state) return;
    setState(s => s ? ({ ...s, journalEntries: [entry, ...s.journalEntries] }) : null);
  };

  const deleteJournalEntry = (id: string) => {
    if (!state) return;
    setState(s => s ? ({ ...s, journalEntries: s.journalEntries.filter(e => e.id !== id) }) : null);
  };

  const markReflectionComplete = (date: string) => {
    if (!state) return;
    setState(s => s ? ({ 
      ...s, 
      completedReflections: s.completedReflections.includes(date) ? s.completedReflections : [...s.completedReflections, date] 
    }) : null);
  };

  const updateSettings = (settings: Partial<AppState>) => {
    if (!state) return;
    setState(s => s ? ({ ...s, ...settings }) : null);
  };

  if (!state) return null; // Or a gentle spinner

  return (
    <StoreContext.Provider value={{ state, completeOnboarding, saveJournalEntry, deleteJournalEntry, markReflectionComplete, updateSettings }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
};
