import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import BackupBar from '@/components/BackupBar';
import EmptyState from '@/components/EmptyState';
import EquipmentCard from '@/components/EquipmentCard';
import FilterChips, { type FilterKey } from '@/components/FilterChips';
import { listEquipment } from '@/db/equipment';
import type { EquipmentWithSummary } from '@/db/types';
import { useI18n } from '@/i18n';
import { useBackup } from '@/services/BackupContext';
import { radius, spacing, type, usePalette } from '@/theme';
import { computeStatus, foldForSearch } from '@/utils/status';

export default function EquipmentList() {
  const db = useSQLiteContext();
  const router = useRouter();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { uploadNow, fetchFromCloud, refreshPending, revision } = useBackup();

  const [equipment, setEquipment] = useState<EquipmentWithSummary[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setEquipment(await listEquipment(db));
    await refreshPending();
  }, [db, refreshPending]);

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
    return [...equipment].sort((a, b) => {
      const left = computeStatus(a);
      const right = computeStatus(b);
      if (left.daysLeft !== right.daysLeft) return left.daysLeft - right.daysLeft;
      return a.name.localeCompare(b.name);
    });
  }, [equipment]);

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
      return [item.name, item.category, item.location]
        .filter(Boolean)
        .some((value) => foldForSearch(value!).includes(term));
    });
  }, [sorted, filter, search]);

  const nothingAtAll = equipment.length === 0;

  return (
    <View style={[styles.screen, { backgroundColor: palette.surfaceSunken }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/about')}
              accessibilityRole="button"
              accessibilityLabel={t.nav.about}
              hitSlop={12}>
              <MaterialCommunityIcons
                name="information-outline"
                size={22}
                color={palette.inkMuted}
              />
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
          { paddingBottom: insets.bottom + 100 },
          visible.length === 0 && styles.contentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullToRefresh}
            tintColor={palette.brand}
          />
        }
        ListHeaderComponent={
          <View>
            <BackupBar />
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

      <Pressable
        onPress={() => router.push('/equipment/new')}
        accessibilityRole="button"
        accessibilityLabel={t.home.newEquipment}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: palette.brand, bottom: insets.bottom + spacing.lg },
          pressed && styles.fabPressed,
        ]}>
        <MaterialCommunityIcons name="plus" size={20} color={palette.onBrand} />
        <Animated.Text style={[type.bodyStrong, { color: palette.onBrand }]}>
          {t.home.newEquipment}
        </Animated.Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  contentEmpty: { flexGrow: 1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: spacing.sm },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  fabPressed: { opacity: 0.9 },
});
