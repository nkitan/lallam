/**
 * Header Component - App header with title and actions
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../theme/useTheme';
import {typography} from '../theme/typography';
import {spacing} from '../theme/spacing';

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  onActionPress?: () => void;
  actionTitle?: string;
  showPerformanceMetrics?: boolean;
  tokensPerSecond?: number;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  onActionPress,
  actionTitle,
  showPerformanceMetrics = false,
  tokensPerSecond,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.leftSection}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.white }]}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.centerSection}>
        <Text style={[styles.title, { color: colors.white }]} numberOfLines={1}>
          {title}
        </Text>
        {showPerformanceMetrics && tokensPerSecond && (
          <Text style={[styles.metricsText, { color: colors.white }]}>
            {tokensPerSecond.toFixed(1)} tok/s
          </Text>
        )}
      </View>
      
      <View style={styles.rightSection}>
        {onActionPress && actionTitle && (
          <TouchableOpacity onPress={onActionPress} style={styles.actionButton}>
            <Text style={[styles.actionButtonText, { color: colors.white }]}>{actionTitle}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  metricsText: {
    fontSize: typography.fontSize.xs,
    opacity: 0.8,
    marginTop: 2,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
});

export default Header;
