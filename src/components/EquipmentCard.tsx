import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import Badge from '@/components/Badge';
import type { EquipmentWithSummary } from '@/db/types';
import { useI18n } from '@/i18n';
import { radius, spacing, type, usePalette } from '@/theme';
import { categoryIcon } from '@/utils/categories';
import {
  computeStatus,
  formatDate,
  statusChipLabel,
  statusColors,
  statusFullLabel,
} from '@/utils/status';

type Props = {
  equipment: EquipmentWithSummary;
  onPress: () => void;
};

export default function EquipmentCard({ equipment, onPress }: Props) {
  const palette = usePalette();
  const { t, locale } = useI18n();

  const status = computeStatus(equipment);
  const colors = statusColors(status, palette);
  const notCopiedYet = equipment.synced === 0;

  // Emphasis by exception: most equipment is fine and stays calm, and only the
  // ones actually demanding attention take on colour, so they carry the eye
  // down a long list.
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
        styles.card,
        {
          backgroundColor: overdue ? colors.bg : palette.surface,
          borderColor: overdue ? colors.fg : palette.line,
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconHolder,
            { backgroundColor: overdue ? palette.surface : palette.surfaceAlt },
          ]}>
          <MaterialCommunityIcons
            name={categoryIcon(equipment.category)}
            size={19}
            color={colors.fg}
          />
        </View>

        <Text style={[type.cardTitle, styles.name, { color: palette.ink }]} numberOfLines={1}>
          {equipment.name}
        </Text>

        <Badge label={statusChipLabel(status, t)} color={colors.fg} background={colors.bg} />
      </View>

      <View style={styles.footerRow}>
        <Text style={[type.support, styles.place, { color: palette.inkMuted }]} numberOfLines={1}>
          {place}
        </Text>
        <Text style={[type.support, { color: palette.inkFaint }]} numberOfLines={1}>
          {lastLine}
        </Text>
      </View>

      {notCopiedYet ? (
        <Animated.View exiting={FadeOut.duration(300)} style={styles.pendingRow}>
          <MaterialCommunityIcons name="cloud-off-outline" size={13} color={palette.inkFaint} />
          <Text style={[type.micro, { color: palette.inkFaint }]}>{t.card.savedHereOnly}</Text>
        </Animated.View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: { opacity: 0.7 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconHolder: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  place: { flex: 1 },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
});
