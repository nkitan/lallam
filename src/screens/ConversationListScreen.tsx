/**
 * ConversationListScreen - Shows list of all conversations
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useChatStore } from '../state/chatStore';
import { useTheme } from '../theme/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Conversation, RootStackParamList } from '../types';
import { formatTimestamp, truncateText } from '../utils/helpers';

type ConversationListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ConversationList'>;

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
  onLongPress: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
  onLongPress,
}) => {
  const { colors } = useTheme();
  
  const preview = conversation.lastMessage 
    ? truncateText(conversation.lastMessage, 100)
    : 'No messages yet';

  const styles = StyleSheet.create({
    conversationItem: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    conversationContent: {
      flex: 1,
    },
    conversationTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    conversationPreview: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: typography.lineHeight.sm,
      marginBottom: spacing.xs,
    },
    conversationTime: {
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
    },
  });

  return (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        <Text style={styles.conversationTitle} numberOfLines={1}>
          {conversation.title}
        </Text>
        <Text style={styles.conversationPreview} numberOfLines={2}>
          {preview}
        </Text>
        <Text style={styles.conversationTime}>
          {formatTimestamp(new Date(conversation.timestamp))}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ConversationListScreen: React.FC = () => {
  const navigation = useNavigation<ConversationListNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const {
    conversations,
    isLoading,
    loadConversations,
    deleteConversation,
    createNewConversation,
  } = useChatStore();

  // Load conversations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  const handleConversationPress = useCallback((conversation: Conversation) => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
    });
  }, [navigation]);

  const handleConversationLongPress = useCallback((conversation: Conversation) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete "${conversation.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteConversation(conversation.id),
        },
      ]
    );
  }, [deleteConversation]);

  const handleNewChat = useCallback(() => {
    navigation.navigate('Chat', {});
  }, [navigation]);

  const renderConversation = useCallback(({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      onPress={() => handleConversationPress(item)}
      onLongPress={() => handleConversationLongPress(item)}
    />
  ), [handleConversationPress, handleConversationLongPress]);

  const renderEmptyState = useCallback(() => {
    const emptyStyles = StyleSheet.create({
      emptyState: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        flex: 1,
        justifyContent: 'center',
      },
      emptyStateTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.sm,
      },
      emptyStateDescription: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: typography.lineHeight.md,
      },
      newChatButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 24,
      },
      newChatButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
      },
    });

    return (
      <View style={emptyStyles.emptyState}>
        <Text style={emptyStyles.emptyStateTitle}>No conversations yet</Text>
        <Text style={emptyStyles.emptyStateDescription}>
          Start your first conversation with LlamaChat
        </Text>
        <TouchableOpacity style={emptyStyles.newChatButton} onPress={handleNewChat}>
          <Text style={emptyStyles.newChatButtonText}>Start New Chat</Text>
        </TouchableOpacity>
      </View>
    );
  }, [colors, handleNewChat]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    newChatIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    newChatIconText: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingVertical: spacing.sm,
    },
    listEmpty: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LlamaChat</Text>
        <TouchableOpacity style={styles.newChatIcon} onPress={handleNewChat}>
          <Text style={styles.newChatIconText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={conversations.length === 0 ? styles.listEmpty : styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

export default ConversationListScreen;
