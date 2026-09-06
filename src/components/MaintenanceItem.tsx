import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Badge from '@/components/Badge';
import type { Maintenance } from '@/db/types';
import { useI18n } from '@/i18n';
import { radius, spacing, type, usePalette } from '@/theme';
import { formatDate } from '@/utils/status';

type Props = {
  maintenance: Maintenance;
  onPress: () => void;
};

export default function MaintenanceItem({ maintenance, onPress }: Props) {
  const palette = usePalette();
  const { t, locale } = useI18n();

  const preventive = maintenance.type === 'preventive';
  const typeLabel = preventive ? t.maintenance.preventive : t.maintenance.corrective;
  const date = formatDate(maintenance.performed_at, locale);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${typeLabel}, ${date}. ${maintenance.description ?? ''}`}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: palette.surface, borderColor: palette.line },
        pressed && styles.pressed,
      ]}>
      <View style={styles.topRow}>
        <Badge
          label={typeLabel}
          icon={preventive ? 'calendar-check-outline' : 'wrench-outline'}
          color={preventive ? palette.brand : palette.warning}
          background={preventive ? palette.brandWash : palette.warningWash}
        />
        <Text style={[type.supportStrong, { color: palette.inkMuted }]}>{date}</Text>
      </View>

      {maintenance.description ? (
        <Text style={[type.body, { color: palette.ink, marginTop: spacing.sm }]}>
          {maintenance.description}
        </Text>
      ) : null}

      <View style={styles.bottomRow}>
        <Text style={[type.support, { color: palette.inkFaint, flex: 1 }]} numberOfLines={1}>
          {maintenance.technician || t.maintenance.noTechnician}
        </Text>
        {maintenance.synced === 0 ? (
          <MaterialCommunityIcons name="cloud-off-outline" size={13} color={palette.inkFaint} />
        ) : null}
        <MaterialCommunityIcons name="chevron-right" size={18} color={palette.inkFaint} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
