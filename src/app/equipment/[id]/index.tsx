import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import MaintenanceItem from '@/components/MaintenanceItem';
import QrCode from '@/components/QrCode';
import SectionTitle from '@/components/SectionTitle';
import { deleteEquipment, findEquipment } from '@/db/equipment';
import { listMaintenance } from '@/db/maintenance';
import { latestReading } from '@/db/nameplates';
import { findScan, listScans } from '@/db/scans';
import type { EquipmentWithSummary, Maintenance, NameplateReading, Scan } from '@/db/types';
import { useI18n } from '@/i18n';
import { useBackup } from '@/services/BackupContext';
import { tagCode } from '@/services/ids';
import { shareLabels } from '@/services/labels';
import { visitLink } from '@/services/qr';
import { radius, spacing, tabular, type, usePalette } from '@/theme';
import { categoryIcon } from '@/utils/categories';
import {
  computeStatus,
  formatDate,
  formatTime,
  statusColors,
  statusFigure,
  statusFullLabel,
} from '@/utils/status';

export default function EquipmentDetail() {
  const { id, scanId } = useLocalSearchParams<{ id: string; scanId?: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t, locale } = useI18n();
  const { refreshPending, uploadNow, revision } = useBackup();

  const [equipment, setEquipment] = useState<EquipmentWithSummary | null>(null);
  const [history, setHistory] = useState<Maintenance[]>([]);
  const [visits, setVisits] = useState<Scan[]>([]);
  const [reading, setReading] = useState<NameplateReading | null>(null);
  const [currentVisit, setCurrentVisit] = useState<Scan | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [printing, setPrinting] = useState(false);

  const load = useCallback(async () => {
    const found = await findEquipment(db, id);
    setEquipment(found);
    setHistory(found ? await listMaintenance(db, id) : []);
    setVisits(found ? await listScans(db, id) : []);
    setReading(found ? await latestReading(db, id) : null);
    setCurrentVisit(scanId ? await findScan(db, scanId) : null);
    setLoaded(true);
    await refreshPending();
  }, [db, id, scanId, refreshPending]);

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

  async function printTag() {
    if (!equipment || printing) return;
    setPrinting(true);
    try {
      await shareLabels([equipment], t.labels);
    } catch (error) {
      console.error('[labels] could not create the tag', error);
      Alert.alert(t.errors.printTitle, t.errors.printBody);
    } finally {
      setPrinting(false);
    }
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
  const figure = statusFigure(status, t);
  const logParams = scanId ? { id, scanId } : { id };

  return (
    <View style={[styles.screen, { backgroundColor: palette.surfaceSunken }]}>
      <Stack.Screen
        options={{
          title: t.nav.equipment.toLocaleUpperCase(),
          headerRight: () => (
            <Pressable
              onPress={() => router.push({ pathname: '/equipment/[id]/edit', params: { id } })}
              accessibilityRole="button"
              accessibilityLabel={t.common.edit}
              hitSlop={12}>
              <MaterialCommunityIcons name="pencil" size={22} color={palette.ink} />
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
            {currentVisit ? (
              <View
                style={[styles.visit, { backgroundColor: palette.okWash, borderColor: palette.ok }]}>
                <MaterialCommunityIcons name="qrcode-scan" size={22} color={palette.ok} />
                <View style={styles.visitText}>
                  <Text style={[type.bodyStrong, { color: palette.ok }]}>
                    {t.detail.visitBanner(formatTime(new Date(currentVisit.scanned_at), locale))}
                  </Text>
                  <Text style={[type.support, { color: palette.ok }]}>
                    {t.detail.visitBannerBody}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={[styles.plate, { backgroundColor: palette.surface, borderColor: palette.ink }]}>
              <View
                accessible
                accessibilityLabel={statusFullLabel(status, t)}
                style={[styles.plateBar, { backgroundColor: colors.fg }]}
              />

              <View style={styles.plateTop}>
                <View style={styles.plateTitle}>
                  <View style={styles.categoryRow}>
                    <MaterialCommunityIcons
                      name={categoryIcon(equipment.category)}
                      size={16}
                      color={palette.inkMuted}
                    />
                    <Text style={[type.micro, { color: palette.inkMuted }]} numberOfLines={1}>
                      {equipment.category || t.common.none}
                    </Text>
                  </View>
                  <Text style={[type.display, { color: palette.ink }]}>{equipment.name}</Text>
                  <Text style={[type.monoStrong, { color: palette.ink }]}>
                    {tagCode(equipment.id)}
                  </Text>
                </View>

                <View style={[styles.qr, { borderColor: palette.ink }]}>
                  <QrCode value={visitLink(equipment.id)} size={96} />
                </View>
              </View>

              <View style={[styles.figureRow, { borderColor: palette.line }]}>
                <Text style={[type.hero, tabular, { color: colors.fg }]}>{figure.value}</Text>
                <Text style={[type.section, { color: colors.fg }]}>{figure.caption}</Text>
              </View>

              <View style={styles.grid}>
                <Cell label={t.sectors.pickerLabel} value={equipment.sector_name || t.sectors.none} />
                <Cell label={t.detail.location} value={equipment.location || t.common.none} />
                <Cell label={t.detail.manufacturer} value={equipment.manufacturer || t.common.none} />
                <Cell label={t.detail.model} value={equipment.model || t.common.none} />
                <Cell label={t.detail.serialNumber} value={equipment.serial_number || t.common.none} mono />
                <Cell label={t.detail.interval} value={t.detail.everyNDays(equipment.interval_days)} />
                <Cell
                  label={t.detail.lastMaintenance}
                  value={formatDate(equipment.last_maintenance, locale)}
                  mono
                />
                <Cell
                  label={t.detail.nextMaintenance}
                  value={formatDate(status.next, locale)}
                  mono
                />
                <Cell label={t.detail.totalDone} value={String(equipment.maintenance_count)} mono />
                <Cell
                  label={t.detail.lastVisit}
                  value={
                    equipment.last_scan ? formatDate(equipment.last_scan, locale) : t.common.none
                  }
                  mono
                />
              </View>
            </View>

            <Button
              label={t.detail.logMaintenance}
              icon="wrench"
              onPress={() => router.push({ pathname: '/equipment/[id]/maintenance', params: logParams })}
              style={styles.primaryAction}
            />
            <Button
              label={t.detail.printTag}
              icon="printer-outline"
              variant="secondary"
              onPress={printTag}
              loading={printing}
              style={styles.secondaryAction}
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
        renderItem={({ item, index }) => (
          <MaintenanceItem
            maintenance={item}
            last={index === history.length - 1}
            onPress={() =>
              router.push({
                pathname: '/equipment/[id]/maintenance',
                params: { id, maintenanceId: item.id },
              })
            }
          />
        )}
        ListFooterComponent={
          <View>
            {reading ? (
              <View>
                <SectionTitle title={t.detail.plateReading} />
                <View
                  style={[
                    styles.reading,
                    { borderColor: palette.ink, backgroundColor: palette.surface },
                  ]}>
                  <View style={styles.readingHead}>
                    <MaterialCommunityIcons name="text-recognition" size={16} color={palette.ink} />
                    <Text style={[type.micro, { color: palette.inkMuted, flex: 1 }]}>
                      {formatDate(reading.created_at, locale)}
                    </Text>
                    {reading.synced === 0 ? (
                      <MaterialCommunityIcons
                        name="cloud-off-outline"
                        size={13}
                        color={palette.inkFaint}
                      />
                    ) : null}
                  </View>
                  <Text style={[type.mono, { color: palette.ink }]}>{reading.raw_text}</Text>
                </View>
              </View>
            ) : null}

            <SectionTitle title={t.detail.visits} count={visits.length} />
            {visits.length === 0 ? (
              <Text style={[type.support, { color: palette.inkMuted }]}>
                {t.detail.visitsEmptyBody}
              </Text>
            ) : (
              visits.map((visit) => (
                <View
                  key={visit.id}
                  style={[styles.visitRow, { borderBottomColor: palette.line }]}>
                  <MaterialCommunityIcons name="qrcode-scan" size={16} color={palette.inkMuted} />
                  <Text style={[type.mono, tabular, { color: palette.ink, flex: 1 }]}>
                    {formatDate(visit.scanned_at, locale)}{'  '}
                    {formatTime(new Date(visit.scanned_at), locale)}
                  </Text>
                  {visit.synced === 0 ? (
                    <MaterialCommunityIcons
                      name="cloud-off-outline"
                      size={13}
                      color={palette.inkFaint}
                    />
                  ) : null}
                </View>
              ))
            )}

            <Button
              label={t.detail.deleteEquipment}
              variant="danger"
              icon="trash-can-outline"
              onPress={confirmDelete}
              disabled={deleting}
              style={styles.deleteAction}
            />
          </View>
        }
      />
    </View>
  );
}

function Cell({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const palette = usePalette();

  return (
    <View style={styles.cell}>
      <Text style={[type.micro, { color: palette.inkFaint }]}>{label}</Text>
      <Text
        style={[mono ? type.monoStrong : type.supportStrong, tabular, { color: palette.ink }]}
        numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  visit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  visitText: { flex: 1, gap: 2 },
  plate: { borderWidth: 1.5, borderRadius: radius.sm, overflow: 'hidden' },
  plateBar: { height: 10 },
  plateTop: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  plateTitle: { flex: 1, gap: 4 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qr: { borderWidth: 1.5 },
  figureRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, rowGap: spacing.lg },
  cell: { width: '50%', gap: 2, paddingRight: spacing.sm },
  primaryAction: { marginTop: spacing.lg },
  secondaryAction: { marginTop: spacing.sm },
  reading: { borderWidth: 1.5, borderRadius: radius.sm, padding: spacing.md, gap: spacing.sm },
  readingHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  deleteAction: { marginTop: spacing.xl },
});
