import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import BrandMark from '@/components/BrandMark';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import { findEquipment } from '@/db/equipment';
import { recordScan } from '@/db/scans';
import { useI18n } from '@/i18n';
import { useBackup } from '@/services/BackupContext';
import { spacing, type, usePalette } from '@/theme';

// Every QR read ends up here, whether it came from the scanner tab or from the
// phone's own camera opening the app through the label's link. That makes this
// the single place where a visit is recorded, so there is no second code path
// that could forget to.
export default function Visit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const palette = usePalette();
  const { t } = useI18n();
  const { fetchFromCloud, uploadNow } = useBackup();

  const [unknown, setUnknown] = useState(false);
  // The effect can run twice for one screen (reload, fast refresh); a visit must
  // be counted once.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    async function run() {
      let equipment = await findEquipment(db, id);

      // A label made on another phone: its equipment may not be here yet.
      if (!equipment) {
        await fetchFromCloud();
        equipment = await findEquipment(db, id);
      }

      if (!equipment) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        setUnknown(true);
        return;
      }

      const scan = await recordScan(db, equipment.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      void uploadNow();

      router.replace({
        pathname: '/equipment/[id]',
        params: { id: equipment.id, scanId: scan.id },
      });
    }

    run().catch((error) => {
      console.error('[visit] could not record the visit', error);
      setUnknown(true);
    });
  }, [db, id, router, fetchFromCloud, uploadNow]);

  if (unknown) {
    return (
      <View style={[styles.screen, { backgroundColor: palette.surfaceSunken }]}>
        <EmptyState
          icon="qrcode-remove"
          title={t.scan.unknownTitle}
          body={t.scan.unknownBody}
        />
        <Button label={t.scan.back} variant="secondary" onPress={() => router.replace('/scan')} />
      </View>
    );
  }

  return (
    <View style={[styles.center, { backgroundColor: palette.surfaceSunken }]}>
      <BrandMark size={64} plate={palette.signal} ink="#161616" />
      <ActivityIndicator color={palette.ink} style={styles.spinner} />
      <Text style={[type.section, { color: palette.inkMuted }]}>{t.scan.recording}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  spinner: { marginTop: spacing.md },
});
