/**
 * Core types for LlamaChat application
 */

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  conversationId: string;
  tokens?: number; // For performance tracking
  // Add role property for LLM compatibility
  role: 'user' | 'assistant';
  content: string; // Alias for text for LLM compatibility
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface LLMConfig {
  modelPath: string;
  modelName: string; // Add model name
  contextSize: number;
  temperature: number;
  topP: number;
  topK: number;
  repeatPenalty: number;
  maxTokens: number;
}

export interface LLMResponse {
  text: string;
  success: boolean;
  error?: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  performance: {
    responseTime: number;
    tokensPerSecond: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  // Legacy properties for backward compatibility
  tokensGenerated?: number;
  processingTime?: number;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
}

export interface LLMState {
  isModelLoaded: boolean;
  modelInfo: {
    name: string;
    size: number;
    path: string;
  } | null;
  config: LLMConfig;
  performance: {
    tokensPerSecond: number;
    averageLatency: number;
  } | null;
  isInitializing: boolean;
  error: string | null;
}

export interface AppSettings {
  selectedModel: string;
  showPerformanceMetrics: boolean;
  autoTitle: boolean;
  darkMode: boolean;
  autoSave: boolean;
  maxConversations: number;
  enableNotifications: boolean;
}

export interface PerformanceMetrics {
  tokensPerSecond: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

// Navigation Types
export type RootStackParamList = {
  ConversationList: undefined;
  Chat: { conversationId?: string };
  Settings: undefined;
};

// Database Models
export interface MessageModel {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  conversationId: string;
  createdAt: number;
  updatedAt: number;
}

export interface ConversationModel {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

// Events
export interface LLMEvent {
  type: 'token' | 'complete' | 'error';
  data: any;
}

export interface ChatEvent {
  type: 'messageAdded' | 'conversationCreated' | 'conversationUpdated';
  data: any;
}
