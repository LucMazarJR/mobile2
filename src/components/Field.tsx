import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { radius, spacing, type, usePalette } from '@/theme';

type FieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function Field({
  label,
  hint,
  error,
  required = false,
  containerStyle,
  ...props
}: FieldProps) {
  const palette = usePalette();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? palette.critical : focused ? palette.ink : palette.line;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={[type.section, { color: palette.inkMuted }]}>{label}</Text>
        {required ? <View style={[styles.dot, { backgroundColor: palette.signal }]} /> : null}
      </View>

      <TextInput
        placeholderTextColor={palette.inkFaint}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        selectionColor={palette.ink}
        style={[
          type.body,
          styles.input,
          {
            backgroundColor: palette.surface,
            borderColor,
            // The thick border only paints on the bottom edge when focused, like a
            // ruled line on a form, and padding compensates so nothing shifts.
            borderBottomWidth: focused || error ? 3 : 1,
            paddingBottom: focused || error ? spacing.md - 2 : spacing.md,
            color: palette.ink,
          },
          props.multiline && styles.multiline,
        ]}
        {...props}
      />

      {error ? (
        <View style={styles.messageRow}>
          <MaterialCommunityIcons name="alert-circle-outline" size={14} color={palette.critical} />
          <Text style={[type.support, { color: palette.critical, flex: 1 }]}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={[type.support, { color: palette.inkFaint, marginTop: spacing.xs }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs + 2 },
  dot: { width: 7, height: 7 },
  input: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.xs },
});
