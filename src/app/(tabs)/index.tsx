import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import BackupBar from '@/components/BackupBar';
import EmptyState from '@/components/EmptyState';
import EquipmentCard from '@/components/EquipmentCard';
import FilterChips, { type FilterKey } from '@/components/FilterChips';
import Wordmark from '@/components/Wordmark';
import { listEquipment } from '@/db/equipment';
import { findSector } from '@/db/sectors';
import type { EquipmentWithSummary } from '@/db/types';
import { useI18n } from '@/i18n';
import { useBackup } from '@/services/BackupContext';
import { radius, spacing, type, usePalette } from '@/theme';
import { computeStatus, foldForSearch } from '@/utils/status';

export default function EquipmentList() {
  const { sectorId } = useLocalSearchParams<{ sectorId?: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { uploadNow, fetchFromCloud, refreshPending, revision } = useBackup();

  const [equipment, setEquipment] = useState<EquipmentWithSummary[]>([]);
  const [sectorName, setSectorName] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setEquipment(await listEquipment(db));
    setSectorName(sectorId ? ((await findSector(db, sectorId))?.name ?? null) : null);
    await refreshPending();
  }, [db, sectorId, refreshPending]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // After an upload the rows change to synced = 1; without re-reading them the
  // cards would keep showing the "saved here only" mark.
  useEffect(() => {
    if (revision === 0) return;
    load();
  }, [revision, load]);

  const onPullToRefresh = useCallback(async () => {
    setRefreshing(true);
    await uploadNow();
    await fetchFromCloud();
    await load();
    setRefreshing(false);
  }, [uploadNow, fetchFromCloud, load]);

  // The product exists to answer "what needs attention now", so the list leads
  // with the most overdue rather than with whatever starts with A.
  const sorted = useMemo(() => {
    const scoped = sectorId ? equipment.filter((item) => item.sector_id === sectorId) : equipment;
    return [...scoped].sort((a, b) => {
      const left = computeStatus(a);
      const right = computeStatus(b);
      if (left.daysLeft !== right.daysLeft) return left.daysLeft - right.daysLeft;
      return a.name.localeCompare(b.name);
    });
  }, [equipment, sectorId]);

  const counts = useMemo(() => {
    const result: Record<FilterKey, number> = {
      all: sorted.length,
      overdue: 0,
      'due-soon': 0,
      'on-track': 0,
    };
    for (const item of sorted) result[computeStatus(item).key] += 1;
    return result;
  }, [sorted]);

  const visible = useMemo(() => {
    const term = foldForSearch(search.trim());
    return sorted.filter((item) => {
      if (filter !== 'all' && computeStatus(item).key !== filter) return false;
      if (!term) return true;
      return [item.name, item.category, item.location, item.sector_name]
        .filter(Boolean)
        .some((value) => foldForSearch(value!).includes(term));
    });
  }, [sorted, filter, search]);

  const nothingAtAll = equipment.length === 0;

  return (
    <View style={[styles.screen, { backgroundColor: palette.surfaceSunken }]}>
      <Stack.Screen
        options={{
          headerTitle: () => <Wordmark />,
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/equipment/new')}
              accessibilityRole="button"
              accessibilityLabel={t.home.newEquipment}
              hitSlop={10}
              style={[styles.addButton, { backgroundColor: palette.ink }]}>
              <MaterialCommunityIcons name="plus" size={22} color={palette.onBrand} />
            </Pressable>
          ),
        }}
      />

      {/* Reanimated's FlatList is what enables itemLayoutAnimation, so
          filtering slides the rows instead of teleporting them. */}
      <Animated.FlatList
        data={visible}
        keyExtractor={(item) => (item as EquipmentWithSummary).id}
        itemLayoutAnimation={LinearTransition.duration(200)}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
          visible.length === 0 && styles.contentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullToRefresh}
            tintColor={palette.ink}
          />
        }
        ListHeaderComponent={
          <View>
            <BackupBar />
            {sectorName ? (
              <Pressable
                onPress={() => router.setParams({ sectorId: undefined })}
                accessibilityRole="button"
                accessibilityLabel={t.sectors.clearFilter}
                style={[styles.sectorTag, { borderColor: palette.ink }]}>
                <MaterialCommunityIcons name="shape-outline" size={16} color={palette.ink} />
                <Text style={[type.micro, { color: palette.ink }]}>{sectorName}</Text>
                <MaterialCommunityIcons name="close" size={16} color={palette.ink} />
              </Pressable>
            ) : null}
            {!nothingAtAll ? (
              <>
                <View
                  style={[
                    styles.searchBox,
                    { backgroundColor: palette.surface, borderColor: palette.line },
                  ]}>
                  <MaterialCommunityIcons name="magnify" size={20} color={palette.inkFaint} />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t.home.searchPlaceholder}
                    placeholderTextColor={palette.inkFaint}
                    accessibilityLabel={t.home.searchPlaceholder}
                    style={[type.body, styles.searchInput, { color: palette.ink }]}
                  />
                  {search.length > 0 ? (
                    <Pressable onPress={() => setSearch('')} hitSlop={10}>
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={18}
                        color={palette.inkFaint}
                      />
                    </Pressable>
                  ) : null}
                </View>

                <FilterChips
                  value={filter}
                  onChange={setFilter}
                  counts={counts}
                  labels={{
                    all: t.home.filterAll,
                    overdue: t.home.filterOverdue,
                    'due-soon': t.home.filterDueSoon,
                    'on-track': t.home.filterOnTrack,
                  }}
                />
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          nothingAtAll ? (
            <EmptyState
              icon="clipboard-text-outline"
              title={t.home.emptyTitle}
              body={t.home.emptyBody}
              actionLabel={t.home.emptyAction}
              onAction={() => router.push('/equipment/new')}
            />
          ) : (
            <EmptyState
              icon="magnify-close"
              title={t.home.noResultsTitle}
              body={t.home.noResultsBody}
            />
          )
        }
        renderItem={({ item }) => (
          <EquipmentCard
            equipment={item as EquipmentWithSummary}
            onPress={() => router.push({
              pathname: '/equipment/[id]',
              params: { id: (item as EquipmentWithSummary).id },
            })}
          />
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: { padding: spacing.lg },
  contentEmpty: { flexGrow: 1 },
  sectorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: spacing.sm },
});
