import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Badge from '@/components/Badge';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import MaintenanceItem from '@/components/MaintenanceItem';
import SectionTitle from '@/components/SectionTitle';
import { deleteEquipment, findEquipment } from '@/db/equipment';
import { listMaintenance } from '@/db/maintenance';
import type { EquipmentWithSummary, Maintenance } from '@/db/types';
import { useI18n } from '@/i18n';
import { useBackup } from '@/services/BackupContext';
import { tagCode } from '@/services/ids';
import { radius, spacing, tabular, type, usePalette } from '@/theme';
import { categoryIcon } from '@/utils/categories';
import { computeStatus, formatDate, statusChipLabel, statusColors, statusFullLabel } from '@/utils/status';

export default function EquipmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t, locale } = useI18n();
  const { refreshPending, uploadNow, revision } = useBackup();

  const [equipment, setEquipment] = useState<EquipmentWithSummary | null>(null);
  const [history, setHistory] = useState<Maintenance[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const found = await findEquipment(db, id);
    setEquipment(found);
    setHistory(found ? await listMaintenance(db, id) : []);
    setLoaded(true);
    await refreshPending();
  }, [db, id, refreshPending]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    if (revision === 0) return;
    load();
  }, [revision, load]);

  function confirmDelete() {
    if (!equipment) return;

    Alert.alert(t.detail.deleteTitle(equipment.name), t.detail.deleteBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          if (deleting) return;
          setDeleting(true);
          try {
            await deleteEquipment(db, id);
            void uploadNow();
            router.back();
          } catch (error) {
            console.error('[equipment] could not delete', error);
            Alert.alert(t.errors.deleteTitle, t.errors.deleteBody);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  if (!loaded) return <View style={{ flex: 1, backgroundColor: palette.surfaceSunken }} />;

  if (!equipment) {
    return (
      <View style={[styles.screen, { backgroundColor: palette.surfaceSunken }]}>
        <EmptyState
          icon="help-circle-outline"
          title={t.detail.notFoundTitle}
          body={t.detail.notFoundBody}
        />
      </View>
    );
  }

  const status = computeStatus(equipment);
  const colors = statusColors(status, palette);

  return (
    <View style={[styles.screen, { backgroundColor: palette.surfaceSunken }]}>
      <Stack.Screen
        options={{
          title: equipment.name,
          headerRight: () => (
            <Pressable
              onPress={() => router.push({ pathname: '/equipment/[id]/edit', params: { id } })}
              accessibilityRole="button"
              accessibilityLabel={t.common.edit}
              hitSlop={12}>
              <MaterialCommunityIcons name="pencil" size={20} color={palette.brand} />
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        ListHeaderComponent={
          <View>
            <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.line }]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name={categoryIcon(equipment.category)}
                  size={26}
                  color={palette.inkMuted}
                />
                <Badge
                  label={statusChipLabel(status, t)}
                  color={colors.fg}
                  background={colors.bg}
                />
              </View>

              <Text style={[type.title, styles.statusLine, { color: colors.fg }]}>
                {statusFullLabel(status, t)}
              </Text>

              <View style={[styles.divider, { backgroundColor: palette.line }]} />

              <Row label={t.detail.category} value={equipment.category || t.common.none} />
              <Row label={t.detail.location} value={equipment.location || t.common.none} />
              <Row
                label={t.detail.interval}
                value={t.detail.everyNDays(equipment.interval_days)}
              />
              <Row
                label={t.detail.lastMaintenance}
                value={formatDate(equipment.last_maintenance, locale)}
              />
              <Row label={t.detail.nextMaintenance} value={formatDate(status.next, locale)} />
              <Row label={t.detail.totalDone} value={String(equipment.maintenance_count)} />
              <Row label={t.detail.tagCode} value={tagCode(equipment.id)} mono />
            </View>

            <Button
              label={t.detail.logMaintenance}
              icon="wrench"
              onPress={() => router.push({ pathname: '/equipment/[id]/maintenance', params: { id } })}
              style={styles.primaryAction}
            />

            <SectionTitle title={t.detail.history} count={history.length} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-clock-outline"
            title={t.detail.historyEmptyTitle}
            body={t.detail.historyEmptyBody}
          />
        }
        renderItem={({ item }) => (
          <MaintenanceItem
            maintenance={item}
            onPress={() => router.push({
              pathname: '/equipment/[id]/maintenance',
              params: { id, maintenanceId: item.id },
            })}
          />
        )}
        ListFooterComponent={
          <Button
            label={t.detail.deleteEquipment}
            variant="danger"
            icon="trash-can-outline"
            onPress={confirmDelete}
            disabled={deleting}
            style={styles.deleteAction}
          />
        }
      />
    </View>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const palette = usePalette();

  return (
    <View style={styles.row}>
      <Text style={[type.support, { color: palette.inkMuted }]}>{label}</Text>
      <Text
        style={[
          mono ? type.mono : type.supportStrong,
          tabular,
          styles.rowValue,
          { color: palette.ink },
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statusLine: { marginBottom: spacing.xs },
  divider: { height: 1, marginVertical: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowValue: { flex: 1, textAlign: 'right' },
  primaryAction: { marginTop: spacing.lg },
  deleteAction: { marginTop: spacing.xl },
});
