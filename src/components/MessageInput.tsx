/**
 * MessageInput Component - Input field for typing messages
 */

import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import {useTheme} from '../theme/useTheme';
import {typography} from '../theme/typography';
import {spacing} from '../theme/spacing';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState('');
  const { colors } = useTheme();

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
        <TextInput
          style={[
            styles.textInput, 
            { color: colors.inputText }, 
            disabled && [styles.textInputDisabled, { color: colors.textLight }]
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          multiline
          maxLength={1000}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton, 
            canSend ? [styles.sendButtonActive, { backgroundColor: colors.primary }] : [styles.sendButtonInactive, { backgroundColor: colors.backgroundSecondary }]
          ]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Text style={[
            styles.sendButtonText, 
            { color: colors.textLight },
            canSend && [styles.sendButtonTextActive, { color: colors.white }]
          ]}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    maxHeight: 100,
    minHeight: 20,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  textInputDisabled: {
    // Color applied dynamically
  },
  sendButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonActive: {
    // Background color applied dynamically
  },
  sendButtonInactive: {
    // Background color applied dynamically
  },
  sendButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  sendButtonTextActive: {
    // Color applied dynamically
  },
});

export default MessageInput;
