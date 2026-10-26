import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, tabular, type, usePalette } from '@/theme';

export type FilterKey = 'all' | 'overdue' | 'due-soon' | 'on-track';

type Props = {
  value: FilterKey;
  onChange: (key: FilterKey) => void;
  counts: Record<FilterKey, number>;
  labels: Record<FilterKey, string>;
};

// Summary and filter in one panel: the big numbers that justify the whole
// product are on screen, and tapping a cell narrows the list. The selected
// cell inverts, like a pressed key.
export default function FilterChips({ value, onChange, counts, labels }: Props) {
  const palette = usePalette();
  const keys: FilterKey[] = ['all', 'overdue', 'due-soon', 'on-track'];

  const accent: Record<FilterKey, string> = {
    all: palette.ink,
    overdue: palette.critical,
    'due-soon': palette.warning,
    'on-track': palette.ok,
  };

  return (
    <View style={[styles.panel, { borderColor: palette.ink, backgroundColor: palette.surface }]}>
      {keys.map((key, index) => {
        const selected = value === key;

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${labels[key]}, ${counts[key]}`}
            style={({ pressed }) => [
              styles.cell,
              index > 0 && { borderLeftWidth: 1, borderLeftColor: palette.line },
              selected && { backgroundColor: palette.ink },
              pressed && styles.pressed,
            ]}>
            <Text
              style={[
                type.figureSmall,
                tabular,
                { color: selected ? palette.surface : accent[key] },
              ]}>
              {counts[key]}
            </Text>
            <Text
              numberOfLines={1}
              style={[type.micro, { color: selected ? palette.surface : palette.inkMuted }]}>
              {labels[key]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  cell: {
    flex: 1,
    minHeight: 64,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.75 },
});
