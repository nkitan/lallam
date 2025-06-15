/**
 * LLM Store - Manages LLM state and configuration
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LLMState, LLMConfig, PerformanceMetrics } from '../types';
import { llmService } from '../services/LLMService';

interface LLMStore extends LLMState {
  // Actions
  initializeModel: (config: LLMConfig) => Promise<boolean>;
  updateConfig: (config: Partial<LLMConfig>) => void;
  updatePerformance: (metrics: PerformanceMetrics) => void;
  setError: (error: string | null) => void;
  cleanup: () => Promise<void>;
  checkModelStatus: () => Promise<void>;
}

const defaultConfig: LLMConfig = {
  modelPath: '',
  modelName: 'Default Model',
  contextSize: 2048,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  repeatPenalty: 1.1,
  maxTokens: 512,
};

export const useLLMStore = create<LLMStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isModelLoaded: false,
      modelInfo: null,
      config: defaultConfig,
      performance: null,
      isInitializing: false,
      error: null,

      // Initialize the model with configuration
      initializeModel: async (config: LLMConfig) => {
        set({ isInitializing: true, error: null });

        try {
          const success = await llmService.initializeModel(config.modelPath, config);
          
          if (success) {
            const modelInfo = await llmService.getModelInfo();
            set({
              isModelLoaded: true,
              modelInfo: {
                name: modelInfo.name,
                size: parseInt(modelInfo.size) || 0,
                path: config.modelPath,
              },
              config,
              isInitializing: false,
            });
          } else {
            set({
              isModelLoaded: false,
              error: 'Failed to initialize model',
              isInitializing: false,
            });
          }

          return success;
        } catch (error) {
          set({
            isModelLoaded: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            isInitializing: false,
          });
          return false;
        }
      },

      // Update model configuration
      updateConfig: (newConfig: Partial<LLMConfig>) => {
        set(state => ({
          config: { ...state.config, ...newConfig }
        }));
      },

      // Update performance metrics
      updatePerformance: (metrics: PerformanceMetrics) => {
        set({ 
          performance: {
            tokensPerSecond: metrics.tokensPerSecond,
            averageLatency: metrics.responseTime,
          }
        });
      },

      // Set error message
      setError: (error: string | null) => {
        set({ error });
      },

      // Cleanup and unload model
      cleanup: async () => {
        try {
          await llmService.cleanup();
          set({
            isModelLoaded: false,
            modelInfo: null,
            performance: null,
            error: null,
          });
        } catch (error) {
          console.error('Error during cleanup:', error);
          set({
            error: error instanceof Error ? error.message : 'Cleanup failed',
          });
        }
      },

      // Check if model is ready
      checkModelStatus: async () => {
        try {
          const isReady = await llmService.isModelLoaded();
          if (isReady !== get().isModelLoaded) {
            set({ isModelLoaded: isReady });
          }
        } catch (error) {
          console.error('Error checking model status:', error);
          set({ 
            isModelLoaded: false,
            error: 'Failed to check model status',
          });
        }
      },
    }),
    {
      name: 'llm-storage',
      storage: createJSONStorage(() => {
        // Use the same storage as chat store
        try {
          const { MMKV } = require('react-native-mmkv');
          const storage = new MMKV();
          return {
            getItem: (key: string) => storage.getString(key) ?? null,
            setItem: (key: string, value: string) => storage.set(key, value),
            removeItem: (key: string) => storage.delete(key),
          };
        } catch {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          return AsyncStorage;
        }
      }),
      partialize: (state) => ({
        config: state.config,
        modelInfo: state.modelInfo,
      }),
    }
  )
);
