/**
 * App Store - Manages global application state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppSettings } from '../types';
import { StorageService } from '../services/StorageService';

interface AppStore {
  // State
  theme: 'light' | 'dark';
  settings: AppSettings;
  isFirstLaunch: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  setFirstLaunch: (isFirst: boolean) => void;
  resetApp: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  selectedModel: 'default',
  showPerformanceMetrics: false,
  autoTitle: true,
  darkMode: false,
  autoSave: true,
  maxConversations: 100,
  enableNotifications: true,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'light',
      settings: defaultSettings,
      isFirstLaunch: true,

      // Set app theme
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        
        // Also update settings
        const currentSettings = get().settings;
        get().updateSettings({ ...currentSettings, darkMode: theme === 'dark' });
      },

      // Update app settings
      updateSettings: async (newSettings: Partial<AppSettings>) => {
        const updatedSettings = { ...get().settings, ...newSettings };
        set({ settings: updatedSettings });
        
        // Update theme if darkMode changed
        if (newSettings.darkMode !== undefined) {
          set({ theme: newSettings.darkMode ? 'dark' : 'light' });
        }
        
        try {
          await StorageService.saveSettings(updatedSettings);
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      },

      // Load settings from storage
      loadSettings: async () => {
        try {
          const settings = await StorageService.loadSettings();
          set({ 
            settings,
            theme: settings.darkMode ? 'dark' : 'light',
          });
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      },

      // Set first launch flag
      setFirstLaunch: (isFirst: boolean) => {
        set({ isFirstLaunch: isFirst });
      },

      // Reset entire app
      resetApp: async () => {
        try {
          await StorageService.clearAllData();
          set({
            theme: 'light',
            settings: defaultSettings,
            isFirstLaunch: true,
          });
        } catch (error) {
          console.error('Error resetting app:', error);
          throw error;
        }
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => {
        // TODO: Re-enable MMKV once it's compatible with React Native 0.80.0
        // try {
        //   const { MMKV } = require('react-native-mmkv');
        //   const storage = new MMKV();
        //   return {
        //     getItem: (key: string) => storage.getString(key) ?? null,
        //     setItem: (key: string, value: string) => storage.set(key, value),
        //     removeItem: (key: string) => storage.delete(key),
        //   };
        // } catch {
        //   const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        //   return AsyncStorage;
        // }
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return AsyncStorage;
      }),
      partialize: (state) => ({
        theme: state.theme,
        settings: state.settings,
        isFirstLaunch: state.isFirstLaunch,
      }),
    }
  )
);
