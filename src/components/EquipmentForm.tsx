import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import CategoryPicker from '@/components/CategoryPicker';
import Field from '@/components/Field';
import SectorPicker from '@/components/SectorPicker';
import { createSector, listSectors } from '@/db/sectors';
import type { EquipmentInput, SectorWithCount } from '@/db/types';
import { useI18n } from '@/i18n';
import { takeOcrResult } from '@/services/ocrBridge';
import { radius, spacing, type, usePalette } from '@/theme';

type Props = {
  initial?: EquipmentInput;
  submitLabel: string;
  showIntro?: boolean;
  onSubmit: (values: EquipmentInput) => Promise<void>;
  onCancel: () => void;
};

// Shared by the create and edit screens: the two forms are identical, and
// keeping one copy is what stops them drifting apart.
export default function EquipmentForm({
  initial,
  submitLabel,
  showIntro = false,
  onSubmit,
  onCancel,
}: Props) {
  const db = useSQLiteContext();
  const router = useRouter();
  const palette = usePalette();
  const { t } = useI18n();

  const [sectors, setSectors] = useState<SectorWithCount[]>([]);
  const [sectorId, setSectorId] = useState<string | null>(initial?.sectorId ?? null);
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [manufacturer, setManufacturer] = useState(initial?.manufacturer ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [serialNumber, setSerialNumber] = useState(initial?.serialNumber ?? '');
  const [nameplateText, setNameplateText] = useState('');
  const [fromPlate, setFromPlate] = useState(false);
  const [interval, setInterval] = useState(String(initial?.intervalDays ?? 30));
  const [errors, setErrors] = useState<{ name?: string; interval?: string }>({});
  const [saving, setSaving] = useState(false);

  const reloadSectors = useCallback(async () => {
    setSectors(await listSectors(db));
  }, [db]);

  useEffect(() => {
    reloadSectors();
  }, [reloadSectors]);

  // Coming back from the nameplate camera: only what it actually found overwrites
  // the form, so a partial read never wipes what was already typed.
  useFocusEffect(
    useCallback(() => {
      const result = takeOcrResult();
      if (!result) return;

      if (result.fields.manufacturer) setManufacturer(result.fields.manufacturer);
      if (result.fields.model) setModel(result.fields.model);
      if (result.fields.serialNumber) setSerialNumber(result.fields.serialNumber);
      setNameplateText(result.rawText);
      setFromPlate(true);
    }, [])
  );

  async function addSector(sectorName: string) {
    const id = await createSector(db, sectorName);
    await reloadSectors();
    return id;
  }

  async function handleSubmit() {
    const intervalDays = Number(interval);
    const found: typeof errors = {};

    if (!name.trim()) found.name = t.equipmentForm.nameError;
    if (!Number.isInteger(intervalDays) || intervalDays <= 0) {
      found.interval = t.equipmentForm.intervalError;
    }

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        category: category.trim(),
        location: location.trim(),
        intervalDays,
        sectorId,
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        serialNumber: serialNumber.trim(),
        nameplateText: nameplateText || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: palette.surfaceSunken }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {showIntro ? (
          <Text style={[type.support, styles.intro, { color: palette.inkMuted }]}>
            {t.equipmentForm.intro}
          </Text>
        ) : null}

        <Pressable
          onPress={() => router.push('/equipment/ocr')}
          accessibilityRole="button"
          accessibilityLabel={t.ocr.formButton}
          style={({ pressed }) => [
            styles.ocrButton,
            { borderColor: palette.ink, backgroundColor: palette.signal },
            pressed && { opacity: 0.8 },
          ]}>
          <MaterialCommunityIcons name="text-recognition" size={26} color={palette.onSignal} />
          <View style={styles.ocrText}>
            <Text style={[type.cardTitle, { color: palette.onSignal }]}>{t.ocr.formButton}</Text>
            <Text style={[type.support, { color: palette.onSignal }]}>
              {fromPlate ? t.ocr.formFilled : t.ocr.formHint}
            </Text>
          </View>
        </Pressable>

        <Field
          label={t.equipmentForm.name}
          required
          value={name}
          onChangeText={setName}
          placeholder={t.equipmentForm.namePlaceholder}
          error={errors.name}
          autoFocus={!initial}
        />

        <CategoryPicker value={category} onChange={setCategory} />

        <SectorPicker
          sectors={sectors}
          value={sectorId}
          onChange={setSectorId}
          onCreate={addSector}
        />

        <Field
          label={t.equipmentForm.location}
          value={location}
          onChangeText={setLocation}
          placeholder={t.equipmentForm.locationPlaceholder}
        />

        <Field
          label={t.equipmentForm.manufacturer}
          value={manufacturer}
          onChangeText={setManufacturer}
          placeholder={t.equipmentForm.manufacturerPlaceholder}
        />

        <Field
          label={t.equipmentForm.model}
          value={model}
          onChangeText={setModel}
          placeholder={t.equipmentForm.modelPlaceholder}
        />

        <Field
          label={t.equipmentForm.serialNumber}
          value={serialNumber}
          onChangeText={setSerialNumber}
          placeholder={t.equipmentForm.serialNumberPlaceholder}
          autoCapitalize="characters"
        />

        <Field
          label={t.equipmentForm.interval}
          required
          value={interval}
          onChangeText={setInterval}
          keyboardType="number-pad"
          placeholder="30"
          hint={t.equipmentForm.intervalHint}
          error={errors.interval}
        />

        <View style={styles.actions}>
          <Button label={submitLabel} icon="check" onPress={handleSubmit} loading={saving} />
          <Button
            label={t.common.cancel}
            variant="secondary"
            onPress={onCancel}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  intro: { marginBottom: spacing.lg },
  ocrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  ocrText: { flex: 1, gap: 2 },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
