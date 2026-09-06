import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeOut } from 'react-native-reanimated';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Badge from '@/components/Badge';
import type { EquipmentWithSummary } from '@/db/types';
import { useI18n } from '@/i18n';
import { radius, spacing, type, usePalette } from '@/theme';
import { categoryIcon } from '@/utils/categories';
import { computeStatus, formatDate, statusChipLabel, statusColors, statusFullLabel } from '@/utils/status';

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

  const place =
    [equipment.category, equipment.location].filter(Boolean).join(' · ') || t.card.noLocation;

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
        { backgroundColor: palette.surface, borderColor: palette.line },
        pressed && styles.pressed,
      ]}>
      {/* The status bar down the left edge turns the list into a traffic-light
          column readable at arm's length. */}
      <View style={[styles.edge, { backgroundColor: colors.fg }]} />

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons
            name={categoryIcon(equipment.category)}
            size={20}
            color={palette.inkMuted}
          />
          <Text style={[type.cardTitle, styles.name, { color: palette.ink }]} numberOfLines={1}>
            {equipment.name}
          </Text>
          <Badge label={statusChipLabel(status, t)} color={colors.fg} background={colors.bg} />
        </View>

        <Text style={[type.support, { color: palette.inkMuted }]} numberOfLines={1}>
          {place}
        </Text>

        <View style={[styles.divider, { backgroundColor: palette.line }]} />

        <View style={styles.footerRow}>
          <Text style={[type.support, { color: palette.inkFaint, flex: 1 }]} numberOfLines={1}>
            {lastLine}
          </Text>
          {notCopiedYet ? (
            <Animated.View exiting={FadeOut.duration(300)} style={styles.pendingRow}>
              <MaterialCommunityIcons name="cloud-off-outline" size={13} color={palette.inkFaint} />
              <Text style={[type.micro, { color: palette.inkFaint }]}>{t.card.savedHereOnly}</Text>
            </Animated.View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.7 },
  edge: { width: 4 },
  body: { flex: 1, padding: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flex: 1 },
  divider: { height: 1, marginVertical: spacing.md },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
