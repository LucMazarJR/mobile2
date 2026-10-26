import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import EquipmentForm from '@/components/EquipmentForm';
import { findEquipment, updateEquipment } from '@/db/equipment';
import { saveReading } from '@/db/nameplates';
import type { EquipmentInput } from '@/db/types';
import { useI18n } from '@/i18n';
import { useBackup } from '@/services/BackupContext';
import { usePalette } from '@/theme';

export default function EditEquipment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const palette = usePalette();
  const { t } = useI18n();
  const { uploadNow } = useBackup();

  const [initial, setInitial] = useState<EquipmentInput | null>(null);

  useEffect(() => {
    findEquipment(db, id).then((found) => {
      if (!found) {
        router.back();
        return;
      }
      setInitial({
        name: found.name,
        category: found.category ?? '',
        location: found.location ?? '',
        intervalDays: found.interval_days,
        sectorId: found.sector_id,
        manufacturer: found.manufacturer ?? '',
        model: found.model ?? '',
        serialNumber: found.serial_number ?? '',
      });
    });
  }, [db, id, router]);

  async function save(values: EquipmentInput) {
    try {
      await updateEquipment(db, id, values);
      if (values.nameplateText) {
        await saveReading(db, id, values.nameplateText, {
          manufacturer: values.manufacturer,
          model: values.model,
          serialNumber: values.serialNumber,
        });
      }
      void uploadNow();
      router.back();
    } catch (error) {
      console.error('[equipment] could not update', error);
      Alert.alert(t.errors.saveTitle, t.errors.saveBody);
    }
  }

  if (!initial) {
    return (
      <View style={[styles.loading, { backgroundColor: palette.surfaceSunken }]}>
        <ActivityIndicator color={palette.brand} />
      </View>
    );
  }

  return (
    <EquipmentForm
      initial={initial}
      submitLabel={t.equipmentForm.saveEdit}
      onSubmit={save}
      onCancel={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
