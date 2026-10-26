import { StyleSheet, Text, View } from 'react-native';

import BrandMark from '@/components/BrandMark';
import { useI18n } from '@/i18n';
import { fonts, spacing, usePalette } from '@/theme';

// Mark plus name, used in the header of the main screen. The plate stays
// yellow in both themes because that is the one place the brand colour is
// allowed to appear by itself.
export default function Wordmark() {
  const palette = usePalette();
  const { t } = useI18n();

  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel={t.brand.name}>
      <BrandMark size={34} plate={palette.signal} ink="#161616" />
      <Text style={[styles.name, { color: palette.ink }]}>{t.brand.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
