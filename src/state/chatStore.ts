/**
 * Chat Store - Manages chat state and conversation history
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { Message, Conversation, ChatState, LLMResponse } from '../types';
import { generateId } from '../utils/helpers';
import { StorageService } from '../services/StorageService';
import { llmService } from '../services/LLMService';

interface ChatStore extends ChatState {
  // Actions
  createNewConversation: () => string;
  selectConversation: (conversationId: string) => void;
  sendMessage: (text: string) => Promise<void>;
  addMessage: (message: Message) => void;
  deleteConversation: (conversationId: string) => void;
  loadConversations: () => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  clearError: () => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
}

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        conversations: [],
        currentConversationId: null,
        messages: [],
        isLoading: false,
        isTyping: false,
        error: null,

        // Create a new conversation
        createNewConversation: () => {
          const newConversation: Conversation = {
            id: generateId(),
            title: 'New Chat',
            lastMessage: '',
            timestamp: Date.now(),
            messageCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          set(state => ({
            conversations: [newConversation, ...state.conversations],
            currentConversationId: newConversation.id,
            messages: [],
          }));

          // Persist to database
          StorageService.saveConversation(newConversation);
          
          return newConversation.id;
        },

        // Select an existing conversation
        selectConversation: async (conversationId: string) => {
          const conversation = get().conversations.find(c => c.id === conversationId);
          if (!conversation) return;

          set({ currentConversationId: conversationId, isLoading: true });

          try {
            const messages = await StorageService.getConversationMessages(conversationId);
            set({ messages, isLoading: false });
          } catch (error) {
            console.error('Error loading conversation messages:', error);
            set({ error: 'Failed to load conversation', isLoading: false });
          }
        },

        // Send a message and get LLM response
        sendMessage: async (text: string) => {
          const { currentConversationId } = get();
          if (!currentConversationId) {
            // Create new conversation if none exists
            const newConversationId = get().createNewConversation();
            set({ currentConversationId: newConversationId });
          }

          const conversationId = get().currentConversationId!;

          // Add user message
          const userMessage: Message = {
            id: generateId(),
            text,
            content: text, // For LLM compatibility
            isUser: true,
            role: 'user' as const,
            timestamp: Date.now(),
            conversationId,
          };

          get().addMessage(userMessage);
          set({ isTyping: true, error: null });

          try {
            // Generate context from recent messages
            const recentMessages = get().messages.slice(-10); // Last 10 messages for context
            
            // Get LLM response
            const response: LLMResponse = await llmService.generateResponse(recentMessages);
            
            // Add LLM message
            const llmMessage: Message = {
              id: generateId(),
              text: response.text,
              content: response.text, // For LLM compatibility
              isUser: false,
              role: 'assistant' as const,
              timestamp: Date.now(),
              conversationId,
              tokens: response.usage.completionTokens,
            };

            get().addMessage(llmMessage);

            // Auto-generate title if this is the first exchange
            const conversation = get().conversations.find(c => c.id === conversationId);
            if (conversation && conversation.messageCount === 2) {
              const title = text.slice(0, 50) + (text.length > 50 ? '...' : '');
              get().updateConversationTitle(conversationId, title);
            }

          } catch (error) {
            console.error('Error generating LLM response:', error);
            set({ error: 'Failed to generate response. Please try again.' });
            
            // Add error message
            const errorMessage: Message = {
              id: generateId(),
              text: 'Sorry, I encountered an error while processing your message. Please try again.',
              content: 'Sorry, I encountered an error while processing your message. Please try again.',
              isUser: false,
              role: 'assistant' as const,
              timestamp: Date.now(),
              conversationId,
            };
            
            get().addMessage(errorMessage);
          } finally {
            set({ isTyping: false });
          }
        },

        // Add a message to the current conversation
        addMessage: (message: Message) => {
          set(state => ({
            messages: [...state.messages, message],
          }));

          // Update conversation metadata
          const conversation = get().conversations.find(c => c.id === message.conversationId);
          if (conversation) {
            const updatedConversation: Conversation = {
              ...conversation,
              lastMessage: message.text,
              timestamp: message.timestamp,
              messageCount: conversation.messageCount + 1,
              updatedAt: Date.now(),
            };

            set(state => ({
              conversations: state.conversations.map(c => 
                c.id === message.conversationId ? updatedConversation : c
              ),
            }));

            // Persist to database
            StorageService.saveMessage(message);
            StorageService.updateConversation(updatedConversation);
          }
        },

        // Delete a conversation
        deleteConversation: async (conversationId: string) => {
          set(state => ({
            conversations: state.conversations.filter(c => c.id !== conversationId),
            currentConversationId: state.currentConversationId === conversationId 
              ? null 
              : state.currentConversationId,
            messages: state.currentConversationId === conversationId ? [] : state.messages,
          }));

          // Remove from database
          await StorageService.deleteConversation(conversationId);
        },

        // Load conversations from storage
        loadConversations: async () => {
          set({ isLoading: true });
          try {
            const conversations = await StorageService.getAllConversations();
            set({ conversations, isLoading: false });
          } catch (error) {
            console.error('Error loading conversations:', error);
            set({ error: 'Failed to load conversations', isLoading: false });
          }
        },

        // Set typing state
        setTyping: (isTyping: boolean) => {
          set({ isTyping });
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        },

        // Update conversation title
        updateConversationTitle: (conversationId: string, title: string) => {
          set(state => ({
            conversations: state.conversations.map(c => 
              c.id === conversationId 
                ? { ...c, title, updatedAt: Date.now() }
                : c
            ),
          }));

          // Update in database
          const conversation = get().conversations.find(c => c.id === conversationId);
          if (conversation) {
            StorageService.updateConversation(conversation);
          }
        },
      }),
      {
        name: 'chat-storage',
        storage: createJSONStorage(() => {
          // Use MMKV for faster storage if available, fallback to AsyncStorage
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
          //   // Fallback to AsyncStorage
          //   const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          //   return AsyncStorage;
          // }
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          return AsyncStorage;
        }),
        partialize: (state) => ({
          conversations: state.conversations.slice(0, 100), // Limit stored conversations
          currentConversationId: state.currentConversationId,
        }),
      }
    )
  )
);
