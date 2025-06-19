/**
 * LLM Service - Interfaces with native llama.cpp bridge
 */

import { Message, PerformanceMetrics, LLMConfig, LLMResponse } from '../types';
import { LlamaCppNative, LlamaCppEventEmitter, LlamaCppEvents } from '../native/LlamaCppBridge';

export class LLMService {
  private static instance: LLMService | null = null;
  private modelLoaded = false;
  private currentConfig: LLMConfig | null = null;
  private listeners: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  /**
   * Initialize the LLM with a model
   */
  public async initializeModel(modelPath: string, config: LLMConfig): Promise<boolean> {
    try {
      console.log('Initializing LLM model:', modelPath);
      
      const result = await LlamaCppNative.initialize(modelPath);
      
      if (result.success) {
        this.modelLoaded = true;
        this.currentConfig = config;
        console.log('Model initialized successfully:', result.message);
        return true;
      } else {
        console.error('Failed to initialize model:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error initializing model:', error);
      return false;
    }
  }

  /**
   * Generate a response from the LLM
   */
  public async generateResponse(
    messages: Message[],
    config?: Partial<LLMConfig>,
    onProgress?: (text: string) => void
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.modelLoaded) {
        throw new Error('Model not loaded. Please initialize first.');
      }

      // Convert messages to a prompt string
      const prompt = this.messagesToPrompt(messages);
      
      // Set up progress listener if provided
      let progressListener: any = null;
      if (onProgress) {
        progressListener = LlamaCppEventEmitter.addListener(
          'onResponseUpdate',
          (event: LlamaCppEvents['onResponseUpdate']) => {
            onProgress(event.text);
          }
        );
      }

      try {
        const result = await LlamaCppNative.generateResponse(prompt);
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const tokensPerSecond = result.tokens > 0 ? (result.tokens / (responseTime / 1000)) : 0;

        return {
          text: result.text,
          success: true,
          model: result.model,
          usage: {
            promptTokens: this.estimateTokens(prompt),
            completionTokens: result.tokens,
            totalTokens: this.estimateTokens(prompt) + result.tokens,
          },
          performance: {
            responseTime,
            tokensPerSecond,
            memoryUsage: 0, // Will be provided by native module in the future
            cpuUsage: 0,    // Will be provided by native module in the future
          },
        };
      } finally {
        // Clean up progress listener
        if (progressListener) {
          progressListener.remove();
        }
      }
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.error('Error generating response:', error);
      
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        model: this.currentConfig?.modelName || 'unknown',
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        performance: {
          responseTime,
          tokensPerSecond: 0,
          memoryUsage: 0,
          cpuUsage: 0,
        },
      };
    }
  }

  /**
   * Check if model is loaded
   */
  public async isModelLoaded(): Promise<boolean> {
    try {
      const loaded = await LlamaCppNative.isModelLoaded();
      this.modelLoaded = loaded;
      return loaded;
    } catch (error) {
      console.error('Error checking model status:', error);
      return false;
    }
  }

  /**
   * Get model information
   */
  public async getModelInfo(): Promise<{
    name: string;
    size: string;
    type: string;
    loaded: boolean;
  }> {
    try {
      return await LlamaCppNative.getModelInfo();
    } catch (error) {
      console.error('Error getting model info:', error);
      return {
        name: 'Unknown',
        size: '0 MB',
        type: 'unknown',
        loaded: false,
      };
    }
  }

  /**
   * Convert messages array to prompt string
   */
  private messagesToPrompt(messages: Message[]): string {
    return messages
      .map(msg => {
        // Support both old and new message formats
        const role = msg.role || (msg.isUser ? 'user' : 'assistant');
        const content = msg.content || msg.text;
        const roleLabel = role === 'user' ? 'Human' : 'Assistant';
        return `${roleLabel}: ${content}`;
      })
      .join('\n\n') + '\n\nAssistant:';
  }

  /**
   * Estimate token count for text (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough approximation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Remove all event listeners
    this.listeners.forEach((listener) => {
      listener.remove();
    });
    this.listeners.clear();
    
    this.modelLoaded = false;
    this.currentConfig = null;
  }
}

// Export singleton instance
export const llmService = LLMService.getInstance();
