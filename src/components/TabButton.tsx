import type { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { Pressable, StyleSheet } from 'react-native';

import { usePalette } from '@/theme';

type Props = BottomTabBarButtonProps & {
  /** Paints the whole cell in signal yellow: the one action that matters most. */
  highlight?: boolean;
};

// Tab bar cell. The active tab gets a heavy bar on top (like a ruled line on a
// form) instead of a tinted icon, and the scan tab is a solid yellow block so it
// is the first thing the eye finds.
export default function TabButton({
  children,
  highlight = false,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  testID,
}: Props) {
  const palette = usePalette();
  const active = Boolean(accessibilityState?.selected);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={({ pressed }) => [
        styles.cell,
        {
          borderTopColor: active ? palette.ink : 'transparent',
          backgroundColor: highlight ? palette.signal : 'transparent',
        },
        pressed && styles.pressed,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { flex: 1, borderTopWidth: 3, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.75 },
});
