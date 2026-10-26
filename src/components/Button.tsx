import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { fonts, radius, spacing, usePalette } from '@/theme';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'signal';
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const palette = usePalette();
  const inactive = disabled || loading;

  const background =
    variant === 'primary'
      ? palette.brand
      : variant === 'signal'
        ? palette.signal
        : 'transparent';

  const foreground =
    variant === 'primary'
      ? palette.onBrand
      : variant === 'signal'
        ? palette.onSignal
        : variant === 'danger'
          ? palette.critical
          : palette.ink;

  const border =
    variant === 'secondary' ? palette.ink : variant === 'danger' ? palette.critical : 'transparent';

  function handlePress() {
    if (inactive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background, borderColor: border },
        pressed && !inactive && styles.pressed,
        inactive && styles.inactive,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <View style={styles.content}>
          {icon ? <MaterialCommunityIcons name={icon} size={19} color={foreground} /> : null}
          <Text style={[styles.label, { color: foreground }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.8, transform: [{ translateY: 1 }] },
  inactive: { opacity: 0.4 },
});
