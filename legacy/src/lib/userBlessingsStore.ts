import { storage } from '../services/storage';

export type MaqsadCategory =
  | 'نعم_الدين'
  | 'نعم_النفس'
  | 'نعم_العقل'
  | 'نعم_النسل'
  | 'نعم_المال'
  | 'نعم_الكون'
  | 'نعم_الوجدان';

export interface UserBlessing {
  id: string;                 // uuid
  title?: string;             // optional short title
  body: string;               // the user's reflection (required)
  valueReflection?: string;   // optional استشعار القيمة reflection
  category?: MaqsadCategory;  // optional tag
  isFavorite: boolean;        // organizational pin only
  source: 'user';             // marks this as personal
  createdAt: number;          // epoch ms
  updatedAt: number;          // epoch ms
}

const STORAGE_KEY = 'alhamd:userBlessings:v1';

export const userBlessingsStore = {
  list: async (): Promise<UserBlessing[]> => {
    try {
      const data = await storage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as UserBlessing[];
    } catch (e) {
      console.error('Failed to load user blessings', e);
      return [];
    }
  },

  get: async (id: string): Promise<UserBlessing | undefined> => {
    const lst = await userBlessingsStore.list();
    return lst.find(b => b.id === id);
  },

  add: async (blessing: Omit<UserBlessing, 'id' | 'createdAt' | 'updatedAt' | 'source'>): Promise<UserBlessing> => {
    const lst = await userBlessingsStore.list();
    const newBlessing: UserBlessing = {
      ...blessing,
      id: crypto.randomUUID(),
      source: 'user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.setItem(STORAGE_KEY, JSON.stringify([newBlessing, ...lst]));
    return newBlessing;
  },

  update: async (id: string, patch: Partial<Omit<UserBlessing, 'id' | 'createdAt' | 'source'>>): Promise<UserBlessing | null> => {
    const lst = await userBlessingsStore.list();
    const index = lst.findIndex(b => b.id === id);
    if (index === -1) return null;

    lst[index] = {
      ...lst[index],
      ...patch,
      updatedAt: Date.now(),
    };
    await storage.setItem(STORAGE_KEY, JSON.stringify(lst));
    return lst[index];
  },

  remove: async (id: string): Promise<void> => {
    const lst = await userBlessingsStore.list();
    const filtered = lst.filter(b => b.id !== id);
    await storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  toggleFavorite: async (id: string): Promise<boolean | null> => {
    const blessing = await userBlessingsStore.get(id);
    if (!blessing) return null;
    const updated = await userBlessingsStore.update(id, { isFavorite: !blessing.isFavorite });
    return updated ? updated.isFavorite : null;
  },

  exportAll: async (): Promise<string> => {
    return await storage.getItem(STORAGE_KEY) || '[]';
  },

  importAll: async (dataStr: string): Promise<void> => {
    try {
      const data = JSON.parse(dataStr);
      if (Array.isArray(data)) {
        await storage.setItem(STORAGE_KEY, dataStr);
      }
    } catch (e) {
      console.error('Failed to import continuous user blessings', e);
    }
  }
};

