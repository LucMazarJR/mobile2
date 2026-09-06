import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import {
  createMaintenance,
  deleteMaintenance,
  findMaintenance,
  updateMaintenance,
} from '@/db/maintenance';
import type { MaintenanceType } from '@/db/types';
import { useI18n } from '@/i18n';
import { useBackup } from '@/services/BackupContext';
import { radius, spacing, type, usePalette } from '@/theme';
import { isFuture, maskDateInput, parseLocalDate, toLocalDateInput } from '@/utils/status';

// One screen serves both creating and editing: the form is identical, so a
// second route would be pure duplication.
export default function MaintenanceScreen() {
  const { id, maintenanceId } = useLocalSearchParams<{ id: string; maintenanceId?: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const palette = usePalette();
  const { t } = useI18n();
  const { uploadNow } = useBackup();

  const editing = Boolean(maintenanceId);

  const [kind, setKind] = useState<MaintenanceType>('preventive');
  const [description, setDescription] = useState('');
  const [technician, setTechnician] = useState('');
  const [date, setDate] = useState(toLocalDateInput(new Date()));
  const [dateError, setDateError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!maintenanceId) return;
    findMaintenance(db, maintenanceId).then((found) => {
      if (!found) return;
      setKind(found.type);
      setDescription(found.description ?? '');
      setTechnician(found.technician ?? '');
      setDate(toLocalDateInput(new Date(found.performed_at)));
    });
  }, [db, maintenanceId]);

  async function save() {
    const iso = parseLocalDate(date);

    if (!iso) {
      setDateError(t.maintenance.dateError);
      return;
    }
    if (isFuture(iso)) {
      setDateError(t.maintenance.dateFutureError);
      return;
    }

    setDateError(null);
    setSaving(true);

    try {
      const values = {
        type: kind,
        description: description.trim(),
        technician: technician.trim(),
        performedAt: iso,
      };

      if (maintenanceId) await updateMaintenance(db, maintenanceId, values);
      else await createMaintenance(db, id, values);

      void uploadNow();
      router.back();
    } catch (error) {
      console.error('[maintenance] could not save', error);
      Alert.alert(t.errors.saveTitle, t.errors.saveBody);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!maintenanceId) return;

    Alert.alert(t.maintenance.deleteTitle, t.maintenance.deleteBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMaintenance(db, maintenanceId);
            void uploadNow();
            router.back();
          } catch (error) {
            console.error('[maintenance] could not delete', error);
            Alert.alert(t.errors.deleteTitle, t.errors.deleteBody);
          }
        },
      },
    ]);
  }

  function setRelativeDate(daysAgo: number) {
    const value = new Date();
    value.setDate(value.getDate() - daysAgo);
    setDate(toLocalDateInput(value));
    setDateError(null);
  }

  const kinds: { value: MaintenanceType; label: string; hint: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
    {
      value: 'preventive',
      label: t.maintenance.preventive,
      hint: t.maintenance.preventiveHint,
      icon: 'calendar-check-outline',
    },
    {
      value: 'corrective',
      label: t.maintenance.corrective,
      hint: t.maintenance.correctiveHint,
      icon: 'wrench-outline',
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: palette.surfaceSunken }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{ title: editing ? t.nav.editMaintenance : t.nav.newMaintenance }}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[type.supportStrong, styles.label, { color: palette.ink }]}>
          {t.maintenance.whatWasDone}
        </Text>
        <View style={styles.options}>
          {kinds.map((option) => {
            const active = kind === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setKind(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[
                  styles.option,
                  {
                    backgroundColor: active ? palette.brandWash : palette.surface,
                    borderColor: active ? palette.brand : palette.line,
                    borderWidth: active ? 2 : 1,
                  },
                ]}>
                <MaterialCommunityIcons
                  name={option.icon}
                  size={20}
                  color={active ? palette.brand : palette.inkMuted}
                />
                <Text
                  style={[type.bodyStrong, { color: active ? palette.brand : palette.ink }]}>
                  {option.label}
                </Text>
                <Text
                  style={[type.support, { color: active ? palette.brand : palette.inkFaint }]}>
                  {option.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Field
          label={t.maintenance.when}
          value={date}
          onChangeText={(text) => {
            setDate(maskDateInput(text));
            setDateError(null);
          }}
          keyboardType="number-pad"
          placeholder={t.maintenance.datePlaceholder}
          error={dateError}
        />

        <View style={styles.dateShortcuts}>
          <Shortcut label={t.maintenance.today} onPress={() => setRelativeDate(0)} />
          <Shortcut label={t.maintenance.yesterday} onPress={() => setRelativeDate(1)} />
          <Shortcut icon="calendar" label="" onPress={() => setShowPicker(true)} />
        </View>

        {showPicker ? (
          <DateTimePicker
            value={parseLocalDate(date) ? new Date(parseLocalDate(date)!) : new Date()}
            mode="date"
            maximumDate={new Date()}
            onChange={(event, selected) => {
              setShowPicker(Platform.OS === 'ios' && event.type !== 'dismissed');
              if (selected) {
                setDate(toLocalDateInput(selected));
                setDateError(null);
              }
            }}
          />
        ) : null}

        <Field
          label={t.maintenance.description}
          value={description}
          onChangeText={setDescription}
          placeholder={t.maintenance.descriptionPlaceholder}
          multiline
          containerStyle={styles.spaced}
        />

        <Field
          label={t.maintenance.technician}
          value={technician}
          onChangeText={setTechnician}
          placeholder={t.maintenance.technicianPlaceholder}
        />

        <View style={styles.actions}>
          <Button
            label={editing ? t.maintenance.saveEdit : t.maintenance.saveNew}
            icon="check"
            onPress={save}
            loading={saving}
          />
          <Button
            label={t.common.cancel}
            variant="secondary"
            onPress={() => router.back()}
            disabled={saving}
          />
          {editing ? (
            <Button
              label={t.common.delete}
              variant="danger"
              icon="trash-can-outline"
              onPress={confirmDelete}
              disabled={saving}
            />
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Shortcut({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
}) {
  const palette = usePalette();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label || 'calendar'}
      style={({ pressed }) => [
        styles.shortcut,
        { backgroundColor: palette.surface, borderColor: palette.line },
        pressed && { opacity: 0.7 },
      ]}>
      {icon ? <MaterialCommunityIcons name={icon} size={16} color={palette.inkMuted} /> : null}
      {label ? <Text style={[type.support, { color: palette.inkMuted }]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  label: { marginBottom: spacing.sm },
  options: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  option: { flex: 1, gap: 2, borderRadius: radius.md, padding: spacing.md },
  dateShortcuts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  spaced: { marginTop: spacing.lg },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
