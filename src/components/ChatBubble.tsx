/**
 * ChatBubble Component - Displays individual messages in the chat
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Message} from '../types';
import {useTheme} from '../theme/useTheme';
import {typography} from '../theme/typography';
import {spacing} from '../theme/spacing';
import {formatTimestamp} from '../utils/helpers';

interface ChatBubbleProps {
  message: Message;
  showTimestamp?: boolean;
  showPerformanceMetrics?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  showTimestamp = false,
  showPerformanceMetrics = false,
}) => {
  const { colors } = useTheme();
  const isUser = message.isUser;
  
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.llmContainer]}>
      <View style={[
        styles.bubble, 
        isUser ? [styles.userBubble, { backgroundColor: colors.userBubble }] : [styles.llmBubble, { backgroundColor: colors.llmBubble, borderColor: colors.border }]
      ]}>
        <Text style={[
          styles.messageText, 
          isUser ? [styles.userText, { color: colors.userBubbleText }] : [styles.llmText, { color: colors.llmBubbleText }]
        ]}>
          {message.text}
        </Text>
        
        {showPerformanceMetrics && !isUser && message.tokens && (
          <Text style={[styles.metricsText, { color: colors.textLight }]}>
            {message.tokens} tokens
          </Text>
        )}
      </View>
      
      {showTimestamp && (
        <Text style={[
          styles.timestamp, 
          isUser ? styles.userTimestamp : styles.llmTimestamp,
          { color: colors.textLight }
        ]}>
          {formatTimestamp(new Date(message.timestamp))}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  llmContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    minHeight: 40,
    justifyContent: 'center',
  },
  userBubble: {
    borderBottomRightRadius: 8,
  },
  llmBubble: {
    borderBottomLeftRadius: 8,
    borderWidth: 1,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.fontWeight.regular,
  },
  userText: {
    // Color applied dynamically
  },
  llmText: {
    // Color applied dynamically
  },
  metricsText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    marginHorizontal: spacing.sm,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  llmTimestamp: {
    textAlign: 'left',
  },
});

export default ChatBubble;
