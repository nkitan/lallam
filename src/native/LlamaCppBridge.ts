/**
 * Native Module Bridge
 * TypeScript interface for the native LlamaCpp module
 */

import { NativeModules, NativeEventEmitter } from 'react-native';

interface LlamaCppNativeModule {
  initialize(modelPath: string): Promise<{success: boolean; message: string}>;
  generateResponse(prompt: string): Promise<{
    text: string;
    success: boolean;
    tokens: number;
    model: string;
  }>;
  isModelLoaded(): Promise<boolean>;
  getModelInfo(): Promise<{
    name: string;
    size: string;
    type: string;
    loaded: boolean;
  }>;
}

// Get the native module
const { LlamaCpp } = NativeModules;

// Create event emitter for native events
const LlamaCppEventEmitter = new NativeEventEmitter(LlamaCpp);

// Export the typed interface
export const LlamaCppNative: LlamaCppNativeModule = LlamaCpp;
export { LlamaCppEventEmitter };

// Event types that can be emitted from native code
export type LlamaCppEvents = {
  onResponseUpdate: {text: string; progress: number};
  onResponseComplete: {text: string; tokens: number};
  onError: {error: string; code: number};
};
