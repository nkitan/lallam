/**
 * Storage Service - Handles local data persistence
 * Using a hybrid approach with AsyncStorage and MMKV for optimal performance
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Conversation, Message, AppSettings } from '../types';

// Try to use MMKV for better performance, fallback to AsyncStorage
let storage: any;
// TODO: Re-enable MMKV once it's compatible with React Native 0.80.0
// try {
//   const { MMKV } = require('react-native-mmkv');
//   const mmkv = new MMKV();
//   storage = {
//     getItem: (key: string) => mmkv.getString(key) ?? null,
//     setItem: (key: string, value: string) => mmkv.set(key, value),
//     removeItem: (key: string) => mmkv.delete(key),
//   };
// } catch {
//   storage = AsyncStorage;
// }
storage = AsyncStorage;

const CONVERSATIONS_KEY = 'llamachat_conversations';
const MESSAGES_PREFIX = 'llamachat_messages_';
const SETTINGS_KEY = 'llamachat_settings';

export class StorageService {
  /**
   * Initialize the storage service
   */
  static async initialize(): Promise<void> {
    try {
      console.log('Storage service initialized');
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  /**
   * Save a conversation to storage
   */
  static async saveConversation(conversation: Conversation): Promise<void> {
    try {
      const conversations = await this.getAllConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.unshift(conversation);
      }
      
      // Keep only the most recent conversations to manage storage size
      const trimmedConversations = conversations.slice(0, 100);
      
      await storage.setItem(CONVERSATIONS_KEY, JSON.stringify(trimmedConversations));
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  /**
   * Update an existing conversation
   */
  static async updateConversation(conversation: Conversation): Promise<void> {
    return this.saveConversation(conversation);
  }

  /**
   * Save a message to storage
   */
  static async saveMessage(message: Message): Promise<void> {
    try {
      const messagesKey = MESSAGES_PREFIX + message.conversationId;
      const existingMessages = await this.getConversationMessages(message.conversationId);
      existingMessages.push(message);
      
      await storage.setItem(messagesKey, JSON.stringify(existingMessages));
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  /**
   * Get all conversations from storage
   */
  static async getAllConversations(): Promise<Conversation[]> {
    try {
      const conversationsData = await storage.getItem(CONVERSATIONS_KEY);
      if (!conversationsData) return [];
      
      const conversations = JSON.parse(conversationsData);
      return conversations.sort((a: Conversation, b: Conversation) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  /**
   * Get messages for a specific conversation
   */
  static async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const messagesKey = MESSAGES_PREFIX + conversationId;
      const messagesData = await storage.getItem(messagesKey);
      if (!messagesData) return [];
      
      const messages = JSON.parse(messagesData);
      return messages.sort((a: Message, b: Message) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      return [];
    }
  }

  /**
   * Delete a conversation and all its messages
   */
  static async deleteConversation(conversationId: string): Promise<void> {
    try {
      // Remove conversation from list
      const conversations = await this.getAllConversations();
      const filteredConversations = conversations.filter(c => c.id !== conversationId);
      await storage.setItem(CONVERSATIONS_KEY, JSON.stringify(filteredConversations));
      
      // Remove messages
      const messagesKey = MESSAGES_PREFIX + conversationId;
      await storage.removeItem(messagesKey);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Delete a specific message
   */
  static async deleteMessage(messageId: string, conversationId: string): Promise<void> {
    try {
      const messages = await this.getConversationMessages(conversationId);
      const filteredMessages = messages.filter(m => m.id !== messageId);
      
      const messagesKey = MESSAGES_PREFIX + conversationId;
      await storage.setItem(messagesKey, JSON.stringify(filteredMessages));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Search messages by text across all conversations
   */
  static async searchMessages(query: string): Promise<Message[]> {
    try {
      const conversations = await this.getAllConversations();
      const allMessages: Message[] = [];
      
      for (const conversation of conversations) {
        const messages = await this.getConversationMessages(conversation.id);
        const matchingMessages = messages.filter(m => 
          m.text.toLowerCase().includes(query.toLowerCase())
        );
        allMessages.push(...matchingMessages);
      }
      
      return allMessages.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Save app settings
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Load app settings
   */
  static async loadSettings(): Promise<AppSettings> {
    try {
      const settingsData = await storage.getItem(SETTINGS_KEY);
      if (!settingsData) {
        // Return default settings
        return {
          selectedModel: 'default',
          showPerformanceMetrics: false,
          autoTitle: true,
          darkMode: false,
          autoSave: true,
          maxConversations: 100,
          enableNotifications: true,
        };
      }
      
      return JSON.parse(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Return default settings on error
      return {
        selectedModel: 'default',
        showPerformanceMetrics: false,
        autoTitle: true,
        darkMode: false,
        autoSave: true,
        maxConversations: 100,
        enableNotifications: true,
      };
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    totalConversations: number;
    totalMessages: number;
    estimatedSize: number;
  }> {
    try {
      const conversations = await this.getAllConversations();
      let totalMessages = 0;
      let estimatedSize = 0;
      
      for (const conversation of conversations) {
        const messages = await this.getConversationMessages(conversation.id);
        totalMessages += messages.length;
        
        // Estimate size (rough calculation)
        const conversationSize = JSON.stringify(conversation).length;
        const messagesSize = JSON.stringify(messages).length;
        estimatedSize += conversationSize + messagesSize;
      }
      
      return {
        totalConversations: conversations.length,
        totalMessages,
        estimatedSize,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalConversations: 0,
        totalMessages: 0,
        estimatedSize: 0,
      };
    }
  }

  /**
   * Clear all data (for debugging/reset)
   */
  static async clearAllData(): Promise<void> {
    try {
      // Get all conversations to find message keys
      const conversations = await this.getAllConversations();
      
      // Remove all message keys
      for (const conversation of conversations) {
        const messagesKey = MESSAGES_PREFIX + conversation.id;
        await storage.removeItem(messagesKey);
      }
      
      // Remove conversations and settings
      await storage.removeItem(CONVERSATIONS_KEY);
      await storage.removeItem(SETTINGS_KEY);
      
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Export conversations to JSON (for backup)
   */
  static async exportData(): Promise<string> {
    try {
      const conversations = await this.getAllConversations();
      const allData: { conversations: Conversation[]; messages: { [key: string]: Message[] } } = {
        conversations,
        messages: {},
      };
      
      for (const conversation of conversations) {
        allData.messages[conversation.id] = await this.getConversationMessages(conversation.id);
      }
      
      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Import conversations from JSON (for restore)
   */
  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.conversations && data.messages) {
        // Save conversations
        await storage.setItem(CONVERSATIONS_KEY, JSON.stringify(data.conversations));
        
        // Save messages for each conversation
        for (const [conversationId, messages] of Object.entries(data.messages)) {
          const messagesKey = MESSAGES_PREFIX + conversationId;
          await storage.setItem(messagesKey, JSON.stringify(messages));
        }
        
        console.log('Data imported successfully');
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}
