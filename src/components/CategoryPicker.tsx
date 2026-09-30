import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Field from '@/components/Field';
import { useI18n } from '@/i18n';
import { radius, spacing, type, usePalette } from '@/theme';
import { CATEGORY_PRESETS } from '@/utils/categories';

type Props = {
  value: string;
  onChange: (category: string) => void;
};

// The same gesture as the sector picker next to it: pick one of the common
// types, or type one that is not in the list. The presets exist because a typo
// in free text used to cost the equipment its icon and split the search.
export default function CategoryPicker({ value, onChange }: Props) {
  const palette = usePalette();
  const { t } = useI18n();

  const presets = CATEGORY_PRESETS.map((preset) => ({
    ...preset,
    label: t.categories[preset.key],
  }));

  const matched = presets.find(
    (preset) => preset.label.toLowerCase() === value.trim().toLowerCase()
  );
  const isCustom = value.trim().length > 0 && !matched;

  const [typing, setTyping] = useState(isCustom);

  function pick(label: string) {
    setTyping(false);
    onChange(label);
  }

  return (
    <View style={styles.container}>
      <Text style={[type.supportStrong, styles.label, { color: palette.ink }]}>
        {t.equipmentForm.category}
      </Text>

      <View style={styles.options}>
        <Chip
          label={t.categories.none}
          selected={!typing && value.trim().length === 0}
          onPress={() => pick('')}
        />

        {presets.map((preset) => (
          <Chip
            key={preset.key}
            icon={preset.icon}
            label={preset.label}
            selected={!typing && matched?.key === preset.key}
            onPress={() => pick(preset.label)}
          />
        ))}

        <Chip
          icon="pencil-outline"
          label={t.categories.other}
          selected={typing}
          onPress={() => {
            setTyping(true);
            if (matched) onChange('');
          }}
        />
      </View>

      {typing ? (
        <Field
          label={t.categories.other}
          value={value}
          onChangeText={onChange}
          placeholder={t.categories.otherPlaceholder}
          autoFocus
          containerStyle={styles.field}
        />
      ) : (
        <Text style={[type.support, { color: palette.inkFaint, marginTop: spacing.xs }]}>
          {t.categories.hint}
        </Text>
      )}
    </View>
  );
}

function Chip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  selected: boolean;
  onPress: () => void;
}) {
  const palette = usePalette();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? palette.brand : palette.surface,
          borderColor: selected ? palette.brand : palette.line,
        },
        pressed && styles.pressed,
      ]}>
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={15}
          color={selected ? palette.onBrand : palette.inkMuted}
        />
      ) : null}
      <Text style={[type.support, { color: selected ? palette.onBrand : palette.inkMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.sm },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pressed: { opacity: 0.75 },
  field: { marginTop: spacing.md, marginBottom: 0 },
});
