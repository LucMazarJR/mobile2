import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import type { EquipmentInput } from '@/db/types';
import { useI18n } from '@/i18n';
import { spacing, type, usePalette } from '@/theme';

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
  const palette = usePalette();
  const { t } = useI18n();

  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [interval, setInterval] = useState(String(initial?.intervalDays ?? 30));
  const [errors, setErrors] = useState<{ name?: string; interval?: string }>({});
  const [saving, setSaving] = useState(false);

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

        <Field
          label={t.equipmentForm.name}
          required
          value={name}
          onChangeText={setName}
          placeholder={t.equipmentForm.namePlaceholder}
          error={errors.name}
          autoFocus={!initial}
        />

        <Field
          label={t.equipmentForm.category}
          value={category}
          onChangeText={setCategory}
          placeholder={t.equipmentForm.categoryPlaceholder}
        />

        <Field
          label={t.equipmentForm.location}
          value={location}
          onChangeText={setLocation}
          placeholder={t.equipmentForm.locationPlaceholder}
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
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
