import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, tabular, type, usePalette } from '@/theme';

export type FilterKey = 'all' | 'overdue' | 'due-soon' | 'on-track';

type Props = {
  value: FilterKey;
  onChange: (key: FilterKey) => void;
  counts: Record<FilterKey, number>;
  labels: Record<FilterKey, string>;
};

// Summary and filter in one row: the counts that justify the whole product are
// on screen, and tapping one narrows the list. No hidden gestures.
export default function FilterChips({ value, onChange, counts, labels }: Props) {
  const palette = usePalette();
  const keys: FilterKey[] = ['all', 'overdue', 'due-soon', 'on-track'];

  const accent: Record<FilterKey, string> = {
    all: palette.brand,
    overdue: palette.critical,
    'due-soon': palette.warning,
    'on-track': palette.ok,
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {keys.map((key) => {
        const selected = value === key;
        const color = accent[key];

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${labels[key]}, ${counts[key]}`}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected ? color : palette.surface,
                borderColor: selected ? color : palette.line,
              },
              pressed && styles.pressed,
            ]}>
            <Text
              style={[type.supportStrong, { color: selected ? palette.onBrand : palette.inkMuted }]}>
              {labels[key]}
            </Text>
            <View
              style={[
                styles.count,
                { backgroundColor: selected ? 'rgba(255,255,255,0.22)' : palette.surfaceAlt },
              ]}>
              <Text
                style={[
                  type.micro,
                  tabular,
                  { color: selected ? palette.onBrand : palette.inkMuted },
                ]}>
                {counts[key]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingBottom: spacing.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pressed: { opacity: 0.75 },
  count: { minWidth: 22, paddingHorizontal: 5, paddingVertical: 2, borderRadius: radius.pill, alignItems: 'center' },
});
