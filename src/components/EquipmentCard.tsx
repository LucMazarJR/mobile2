import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import type { EquipmentWithSummary } from '@/db/types';
import { useI18n } from '@/i18n';
import { tagCode } from '@/services/ids';
import { radius, spacing, tabular, type, usePalette } from '@/theme';
import { categoryIcon } from '@/utils/categories';
import {
  computeStatus,
  formatDate,
  statusColors,
  statusFigure,
  statusFullLabel,
} from '@/utils/status';

type Props = {
  equipment: EquipmentWithSummary;
  onPress: () => void;
};

// A row of the inspection sheet: status stripe on the left, identification in
// the middle, and the one number that matters on the right.
export default function EquipmentCard({ equipment, onPress }: Props) {
  const palette = usePalette();
  const { t, locale } = useI18n();

  const status = computeStatus(equipment);
  const colors = statusColors(status, palette);
  const figure = statusFigure(status, t);
  const notCopiedYet = equipment.synced === 0;

  // Emphasis by exception: most equipment is fine and stays calm, and only the
  // overdue ones take on a tinted ground, so they carry the eye down the list.
  const overdue = status.key === 'overdue';

  const place =
    [equipment.sector_name, equipment.location].filter(Boolean).join(' / ') ||
    equipment.category ||
    t.card.noLocation;

  const lastLine = equipment.last_maintenance
    ? t.card.last(formatDate(equipment.last_maintenance, locale))
    : t.card.neverServiced;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${equipment.name}. ${statusFullLabel(status, t)}.${
        notCopiedYet ? ` ${t.card.savedHereOnly}.` : ''
      }`}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: overdue ? palette.criticalWash : palette.surface,
          borderColor: palette.line,
        },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.stripe, { backgroundColor: colors.fg }]} />

      <View style={styles.body}>
        <View style={styles.codeRow}>
          <MaterialCommunityIcons
            name={categoryIcon(equipment.category)}
            size={14}
            color={palette.inkMuted}
          />
          <Text style={[type.micro, { color: palette.inkMuted }]}>{tagCode(equipment.id)}</Text>
          {notCopiedYet ? (
            <Animated.View exiting={FadeOut.duration(300)}>
              <MaterialCommunityIcons
                name="cloud-off-outline"
                size={13}
                color={palette.inkFaint}
                accessibilityLabel={t.card.savedHereOnly}
              />
            </Animated.View>
          ) : null}
        </View>

        <Text style={[type.cardTitle, { color: palette.ink }]} numberOfLines={1}>
          {equipment.name}
        </Text>

        <Text style={[type.support, { color: palette.inkMuted }]} numberOfLines={1}>
          {place}
        </Text>
        <Text style={[type.support, { color: palette.inkFaint }]} numberOfLines={1}>
          {lastLine}
        </Text>
      </View>

      <View style={styles.figure}>
        <Text style={[type.figure, tabular, { color: colors.fg }]}>{figure.value}</Text>
        <Text style={[type.micro, styles.caption, { color: colors.fg }]} numberOfLines={2}>
          {figure.caption}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Rows share their hairlines (the negative margin overlaps each border with
  // the next), so the list reads as one sheet rather than loose cards.
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderRadius: radius.sm,
    marginBottom: -1,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.7 },
  stripe: { width: 6 },
  body: { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.md, gap: 1 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  figure: {
    width: 84,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: spacing.md,
  },
  caption: { textAlign: 'right', maxWidth: 80 },
});
