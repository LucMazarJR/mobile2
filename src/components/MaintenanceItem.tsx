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
  /** Last row of the timeline: the vertical line stops here. */
  last?: boolean;
};

// One entry of the timeline. The marker sits on a vertical line that links the
// entries, so the history reads top to bottom as a sequence of events.
export default function MaintenanceItem({ maintenance, onPress, last = false }: Props) {
  const palette = usePalette();
  const { t, locale } = useI18n();

  const preventive = maintenance.type === 'preventive';
  const typeLabel = preventive ? t.maintenance.preventive : t.maintenance.corrective;
  const date = formatDate(maintenance.performed_at, locale);
  const verified = Boolean(maintenance.scan_id);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${typeLabel}, ${date}. ${maintenance.description ?? ''}${
        verified ? `. ${t.maintenance.verified}` : ''
      }`}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      <View style={styles.rail}>
        <View
          style={[
            styles.marker,
            {
              backgroundColor: preventive ? palette.ink : palette.warning,
              borderColor: palette.surfaceSunken,
            },
          ]}
        />
        {!last ? <View style={[styles.line, { backgroundColor: palette.line }]} /> : null}
      </View>

      <View style={[styles.content, { borderColor: palette.line, backgroundColor: palette.surface }]}>
        <View style={styles.topRow}>
          <Text style={[type.monoStrong, { color: palette.ink }]}>{date}</Text>
          <Badge
            label={typeLabel}
            icon={preventive ? 'calendar-check-outline' : 'wrench-outline'}
            color={preventive ? palette.ink : palette.warning}
            background="transparent"
          />
        </View>

        {maintenance.description ? (
          <Text style={[type.body, { color: palette.ink, marginTop: spacing.sm }]}>
            {maintenance.description}
          </Text>
        ) : null}

        {verified ? (
          <View style={styles.verified}>
            <MaterialCommunityIcons name="qrcode-scan" size={13} color={palette.ok} />
            <Text style={[type.micro, { color: palette.ok }]}>{t.maintenance.verified}</Text>
          </View>
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
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: spacing.md },
  pressed: { opacity: 0.7 },
  rail: { width: 14, alignItems: 'center' },
  marker: { width: 12, height: 12, marginTop: spacing.lg, borderWidth: 2 },
  line: { width: 2, flex: 1 },
  content: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.sm },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
