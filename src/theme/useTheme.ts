/**
 * Theme hook and context
 */

import { useMemo } from 'react';
import { useAppStore } from '../state/appStore';
import { lightColors, darkColors } from './colors';

export const useTheme = () => {
  const theme = useAppStore(state => state.theme);
  
  const colors = useMemo(() => {
    return theme === 'dark' ? darkColors : lightColors;
  }, [theme]);

  return {
    theme,
    colors,
    isDark: theme === 'dark',
  };
};

export type Theme = ReturnType<typeof useTheme>;
