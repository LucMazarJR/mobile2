import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import Field from '@/components/Field';
import { listEquipment } from '@/db/equipment';
import { createSector, deleteSector, listSectors, renameSector } from '@/db/sectors';
import type { EquipmentWithSummary, SectorWithCount } from '@/db/types';
import { useI18n } from '@/i18n';
import { useBackup } from '@/services/BackupContext';
import { shareLabels } from '@/services/labels';
import { radius, spacing, tabular, type, usePalette } from '@/theme';
import { computeStatus } from '@/utils/status';

export default function Sectors() {
  const db = useSQLiteContext();
  const router = useRouter();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { uploadNow } = useBackup();

  const [sectors, setSectors] = useState<SectorWithCount[]>([]);
  const [equipment, setEquipment] = useState<EquipmentWithSummary[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setSectors(await listSectors(db));
    setEquipment(await listEquipment(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Overdue is derived the same way the list screen derives it, so the two can
  // never disagree.
  function overdueIn(sectorId: string) {
    return equipment.filter(
      (item) => item.sector_id === sectorId && computeStatus(item).key === 'overdue'
    ).length;
  }

  async function submit() {
    if (!name.trim()) {
      setError(t.sectors.nameError);
      return;
    }

    setSaving(true);
    try {
      if (editingId) await renameSector(db, editingId, name.trim());
      else await createSector(db, name.trim());

      setName('');
      setEditingId(null);
      setError(null);
      await load();
      void uploadNow();
    } catch (problem) {
      console.error('[sectors] could not save', problem);
      Alert.alert(t.errors.saveTitle, t.errors.saveBody);
    } finally {
      setSaving(false);
    }
  }

  async function printSector(sector: SectorWithCount) {
    const items = equipment.filter((item) => item.sector_id === sector.id);
    if (items.length === 0) {
      Alert.alert(sector.name, t.sectors.printEmpty);
      return;
    }

    try {
      await shareLabels(items, t.labels);
    } catch (problem) {
      console.error('[sectors] could not create the tags', problem);
      Alert.alert(t.errors.printTitle, t.errors.printBody);
    }
  }

  function confirmDelete(sector: SectorWithCount) {
    Alert.alert(t.sectors.deleteTitle(sector.name), t.sectors.deleteBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSector(db, sector.id);
            await load();
            void uploadNow();
          } catch (problem) {
            console.error('[sectors] could not delete', problem);
            Alert.alert(t.errors.deleteTitle, t.errors.deleteBody);
          }
        },
      },
    ]);
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.surfaceSunken }]}>
      <FlatList
        data={sectors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.xxl },
          sectors.length === 0 && styles.contentEmpty,
        ]}
        // Without this the first tap on the button below only dismisses the
        // keyboard and never reaches it, so creating a sector would take two
        // taps for no visible reason.
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={[type.body, styles.intro, { color: palette.inkMuted }]}>
              {t.sectors.subtitle}
            </Text>

            <Field
              label={editingId ? t.sectors.rename : t.sectors.newSector}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(null);
              }}
              placeholder={t.sectors.namePlaceholder}
              error={error}
              containerStyle={styles.field}
            />

            <View style={styles.formActions}>
              <Button
                label={editingId ? t.sectors.saveName : t.sectors.create}
                icon={editingId ? 'check' : 'plus'}
                onPress={submit}
                loading={saving}
                style={styles.grow}
              />
              {editingId ? (
                <Button
                  label={t.common.cancel}
                  variant="secondary"
                  onPress={() => {
                    setEditingId(null);
                    setName('');
                    setError(null);
                  }}
                  style={styles.grow}
                />
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="shape-outline"
            title={t.sectors.emptyTitle}
            body={t.sectors.emptyBody}
          />
        }
        renderItem={({ item }) => {
          const overdue = overdueIn(item.id);

          return (
            <Pressable
              onPress={() => router.push({ pathname: '/', params: { sectorId: item.id } })}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${t.sectors.countEquipment(item.equipment_count)}`}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: palette.surface, borderColor: palette.line },
                pressed && styles.pressed,
              ]}>
              <View style={[styles.count, { borderRightColor: palette.line }]}>
                <Text style={[type.figure, tabular, { color: palette.ink }]}>
                  {item.equipment_count}
                </Text>
              </View>

              <View style={styles.rowText}>
                <Text style={[type.cardTitle, { color: palette.ink }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    type.micro,
                    tabular,
                    { color: overdue > 0 ? palette.critical : palette.inkFaint },
                  ]}>
                  {overdue > 0
                    ? t.sectors.countOverdue(overdue)
                    : t.sectors.countEquipment(item.equipment_count)}
                </Text>
              </View>

              <Pressable
                onPress={() => printSector(item)}
                accessibilityRole="button"
                accessibilityLabel={t.sectors.printLabels}
                hitSlop={10}
                style={styles.rowAction}>
                <MaterialCommunityIcons name="printer-outline" size={18} color={palette.ink} />
              </Pressable>

              <Pressable
                onPress={() => {
                  setEditingId(item.id);
                  setName(item.name);
                  setError(null);
                }}
                accessibilityRole="button"
                accessibilityLabel={t.sectors.rename}
                hitSlop={10}
                style={styles.rowAction}>
                <MaterialCommunityIcons name="pencil" size={18} color={palette.ink} />
              </Pressable>

              <Pressable
                onPress={() => confirmDelete(item)}
                accessibilityRole="button"
                accessibilityLabel={t.common.delete}
                hitSlop={10}
                style={styles.rowAction}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color={palette.critical}
                />
              </Pressable>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  contentEmpty: { flexGrow: 1 },
  intro: { marginBottom: spacing.lg },
  field: { marginBottom: spacing.sm },
  formActions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  grow: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingRight: spacing.md,
    marginBottom: -1,
    overflow: 'hidden',
  },
  count: {
    width: 64,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  pressed: { opacity: 0.7 },
  rowText: { flex: 1, gap: 2, paddingVertical: spacing.md },
  rowAction: { padding: spacing.xs },
});
