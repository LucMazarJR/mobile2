import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import EquipmentForm from '@/components/EquipmentForm';
import { createEquipment } from '@/db/equipment';
import type { EquipmentInput } from '@/db/types';
import { useI18n } from '@/i18n';
import { useBackup } from '@/services/BackupContext';

export default function NewEquipment() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { t } = useI18n();
  const { uploadNow } = useBackup();

  async function save(values: EquipmentInput) {
    try {
      // Saved locally first — that is what makes this work with no signal. The
      // upload right after is only an opportunistic attempt.
      await createEquipment(db, values);
      void uploadNow();
      router.back();
    } catch (error) {
      console.error('[equipment] could not save', error);
      Alert.alert(t.errors.saveTitle, t.errors.saveBody);
    }
  }

  return (
    <EquipmentForm
      showIntro
      submitLabel={t.equipmentForm.saveNew}
      onSubmit={save}
      onCancel={() => router.back()}
    />
  );
}
