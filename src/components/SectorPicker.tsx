import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Field from '@/components/Field';
import type { SectorWithCount } from '@/db/types';
import { useI18n } from '@/i18n';
import { radius, spacing, type, usePalette } from '@/theme';

type Props = {
  sectors: SectorWithCount[];
  value: string | null;
  onChange: (sectorId: string | null) => void;
  onCreate: (name: string) => Promise<string>;
};

// Picking a sector and inventing one are the same gesture here: nobody should
// have to leave the form, go create a sector, and come back.
export default function SectorPicker({ sectors, value, onChange, onCreate }: Props) {
  const palette = usePalette();
  const { t } = useI18n();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function confirmCreate() {
    if (!name.trim()) {
      setError(t.sectors.nameError);
      return;
    }

    const id = await onCreate(name.trim());
    onChange(id);
    setName('');
    setError(null);
    setCreating(false);
  }

  const options: { id: string | null; label: string }[] = [
    { id: null, label: t.sectors.none },
    ...sectors.map((sector) => ({ id: sector.id, label: sector.name })),
  ];

  return (
    <View style={styles.container}>
      <Text style={[type.section, { color: palette.inkMuted, marginBottom: spacing.sm }]}>
        {t.sectors.pickerLabel}
      </Text>

      <View style={styles.options}>
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <Pressable
              key={option.id ?? 'none'}
              onPress={() => onChange(option.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? palette.brand : palette.surface,
                  borderColor: selected ? palette.brand : palette.line,
                  borderWidth: 1.5,
                },
              ]}>
              <Text
                style={[
                  type.support,
                  { color: selected ? palette.onBrand : palette.inkMuted },
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}

        {!creating ? (
          <Pressable
            onPress={() => setCreating(true)}
            accessibilityRole="button"
            accessibilityLabel={t.sectors.newSector}
            style={[styles.chip, styles.chipDashed, { borderColor: palette.brand }]}>
            <MaterialCommunityIcons name="plus" size={14} color={palette.brand} />
            <Text style={[type.support, { color: palette.brand }]}>{t.sectors.newSector}</Text>
          </Pressable>
        ) : null}
      </View>

      {creating ? (
        <View style={styles.createBox}>
          <Field
            label={t.sectors.newSector}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError(null);
            }}
            placeholder={t.sectors.namePlaceholder}
            error={error}
            autoFocus
            containerStyle={styles.createField}
          />
          <View style={styles.createActions}>
            <Pressable onPress={confirmCreate} accessibilityRole="button" hitSlop={8}>
              <Text style={[type.supportStrong, { color: palette.brand }]}>
                {t.sectors.create}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setCreating(false);
                setName('');
                setError(null);
              }}
              accessibilityRole="button"
              hitSlop={8}>
              <Text style={[type.support, { color: palette.inkFaint }]}>{t.common.cancel}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Text style={[type.support, { color: palette.inkFaint, marginTop: spacing.xs }]}>
          {t.sectors.pickerHint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  chipDashed: { borderStyle: 'dashed' },
  createBox: { marginTop: spacing.md },
  createField: { marginBottom: spacing.sm },
  createActions: { flexDirection: 'row', gap: spacing.lg },
});
