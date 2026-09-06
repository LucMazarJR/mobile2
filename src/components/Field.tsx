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

  const borderColor = error ? palette.critical : focused ? palette.brand : palette.line;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={[type.supportStrong, { color: palette.ink }]}>{label}</Text>
        {required ? <View style={[styles.dot, { backgroundColor: palette.brand }]} /> : null}
      </View>

      <TextInput
        placeholderTextColor={palette.inkFaint}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        style={[
          type.body,
          styles.input,
          {
            backgroundColor: palette.surface,
            borderColor,
            borderWidth: focused || error ? 2 : 1,
            color: palette.ink,
            // Keeps the box from shifting when the border thickens on focus.
            paddingHorizontal: focused || error ? spacing.md - 1 : spacing.md,
            paddingVertical: focused || error ? spacing.md - 1 : spacing.md,
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
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3 },
  input: { borderRadius: radius.md },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.xs },
});
