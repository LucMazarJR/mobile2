import { StyleSheet, Text, View } from 'react-native';

import { spacing, tabular, type, usePalette } from '@/theme';

type Props = {
  title: string;
  count?: number;
};

// Label followed by a rule that runs to the edge, like the heading of a
// section on a printed inspection sheet.
export default function SectionTitle({ title, count }: Props) {
  const palette = usePalette();

  return (
    <View style={styles.row}>
      <Text style={[type.section, { color: palette.ink }]}>{title}</Text>
      <View style={[styles.rule, { backgroundColor: palette.line }]} />
      {typeof count === 'number' ? (
        <Text style={[type.micro, tabular, { color: palette.inkMuted }]}>{count}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  rule: { flex: 1, height: 1 },
});
