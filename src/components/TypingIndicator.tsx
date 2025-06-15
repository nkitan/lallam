/**
 * TypingIndicator Component - Shows when LLM is thinking/generating response
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {useTheme} from '../theme/useTheme';
import {typography} from '../theme/typography';
import {spacing} from '../theme/spacing';

interface TypingIndicatorProps {
  visible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({visible}) => {
  const [animatedValues] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      const animations = animatedValues.map((animValue, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        )
      );

      animations.forEach(anim => anim.start());

      return () => {
        animations.forEach(anim => anim.stop());
      };
    } else {
      animatedValues.forEach(animValue => animValue.setValue(0));
    }
  }, [visible, animatedValues]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.bubble, { backgroundColor: colors.llmBubble, borderColor: colors.border }]}>
        <Text style={[styles.text, { color: colors.textSecondary }]}>LlamaChat is thinking</Text>
        <View style={styles.dotsContainer}>
          {animatedValues.map((animValue, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: colors.primary },
                {
                  opacity: animValue,
                  transform: [
                    {
                      scale: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  bubble: {
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
    marginRight: spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
});

export default TypingIndicator;
