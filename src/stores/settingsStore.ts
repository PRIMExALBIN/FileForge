import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings } from '@/types';

interface SettingsState extends UserSettings {
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setDefaultQuality: (quality: number) => void;
    setAutoClearCompleted: (enabled: boolean) => void;
    setAutoClearDelay: (minutes: number) => void;
    toggleShowEstimatedTime: () => void;
    toggleQuickConvert: () => void;
}

const defaultSettings: UserSettings = {
    theme: 'system',
    defaultQuality: 85,
    autoClearCompleted: true,
    autoClearDelay: 5,
    showEstimatedTime: true,
    enableQuickConvert: true,
    defaultPresets: {},
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...defaultSettings,

            setTheme: (theme) => set({ theme }),

            setDefaultQuality: (quality) => set({ defaultQuality: quality }),

            setAutoClearCompleted: (enabled) => set({ autoClearCompleted: enabled }),

            setAutoClearDelay: (minutes) => set({ autoClearDelay: minutes }),

            toggleShowEstimatedTime: () =>
                set((state) => ({ showEstimatedTime: !state.showEstimatedTime })),

            toggleQuickConvert: () =>
                set((state) => ({ enableQuickConvert: !state.enableQuickConvert })),
        }),
        {
            name: 'file-converter-settings',
        }
    )
);
