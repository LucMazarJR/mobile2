import { StyleSheet, Text, View } from 'react-native';

import { spacing, tabular, type, usePalette } from '@/theme';

type Props = {
  title: string;
  count?: number;
};

export default function SectionTitle({ title, count }: Props) {
  const palette = usePalette();

  return (
    <View style={styles.row}>
      <Text style={[type.section, { color: palette.inkFaint }]}>{title}</Text>
      {typeof count === 'number' ? (
        <Text style={[type.micro, tabular, { color: palette.inkFaint }]}>{count}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});
