/**
 * ChatScreen - Main chat interface
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import { useChatStore } from '../state/chatStore';
import { useLLMStore } from '../state/llmStore';
import { useTheme } from '../theme/useTheme';
import { spacing } from '../theme/spacing';
import { Message, RootStackParamList, LLMConfig } from '../types';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const { colors } = useTheme();

  // Chat store
  const {
    messages,
    currentConversationId,
    isTyping,
    isLoading,
    error,
    sendMessage,
    createNewConversation,
    selectConversation,
    clearError,
  } = useChatStore();

  // LLM store
  const {
    isModelLoaded,
    isInitializing,
    initializeModel,
    config,
    error: llmError,
    setError: setLLMError,
  } = useLLMStore();

  useEffect(() => {
    // Initialize conversation
    const conversationId = route.params?.conversationId;
    if (conversationId) {
      selectConversation(conversationId);
    } else if (!currentConversationId) {
      createNewConversation();
    }
  }, [route.params?.conversationId, selectConversation, createNewConversation, currentConversationId]);

  useEffect(() => {
    // Initialize LLM if not ready
    const initializeLLM = async () => {
      if (!isModelLoaded && !isInitializing) {
        try {
          const defaultConfig: LLMConfig = {
            modelPath: 'bundled://model.gguf',
            modelName: 'Default Model',
            contextSize: 2048,
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            repeatPenalty: 1.1,
            maxTokens: 512,
          };
          
          const initialized = await initializeModel(defaultConfig);
          
          if (!initialized) {
            Alert.alert(
              'Model Loading Error',
              'Failed to load the language model. The app will use a mock implementation for demonstration.'
            );
          }
        } catch (error) {
          console.error('Error initializing LLM:', error);
          setLLMError(error instanceof Error ? error.message : 'Failed to initialize LLM');
        }
      }
    };

    initializeLLM();
  }, [isModelLoaded, isInitializing, initializeModel, setLLMError]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    // Clear errors after some time
    if (error) {
      const timeout = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [error, clearError]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    if (!currentConversationId) {
      const newConversationId = createNewConversation();
      // Wait a bit for the conversation to be created
      setTimeout(() => {
        sendMessage(text);
      }, 100);
    } else {
      await sendMessage(text);
    }
  }, [currentConversationId, createNewConversation, sendMessage]);

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble 
      message={item} 
      showTimestamp 
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Welcome to LlamaChat
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {isInitializing 
          ? "Loading language model..." 
          : isModelLoaded 
            ? "Start a conversation by typing a message below"
            : "Model not loaded - using demo mode"
        }
      </Text>
    </View>
  );

  const isReady = isModelLoaded || !isInitializing; // Allow mock mode

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {(error || llmError) && (
          <View style={[styles.errorBanner, { backgroundColor: colors.error }]}>
            <Text style={styles.errorText}>
              {error || llmError}
            </Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          style={[styles.messagesList, { backgroundColor: colors.backgroundChat }]}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesContainer,
            messages.length === 0 && styles.emptyContainer
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />
        
        {isTyping && <TypingIndicator visible={true} />}
        
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isTyping || !isReady}
          placeholder={
            !isReady 
              ? "Loading model..." 
              : isTyping 
                ? "Generating response..." 
                : "Type a message..."
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorBanner: {
    padding: spacing.md,
    margin: spacing.sm,
    borderRadius: 8,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ChatScreen;
