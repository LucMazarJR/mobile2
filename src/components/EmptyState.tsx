import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { spacing, type, usePalette } from '@/theme';

type Props = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({ icon, title, body, actionLabel, onAction }: Props) {
  const palette = usePalette();

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: palette.surfaceAlt }]}>
        <MaterialCommunityIcons name={icon} size={30} color={palette.inkFaint} />
      </View>
      <Text style={[type.cardTitle, styles.title, { color: palette.ink }]}>{title}</Text>
      <Text style={[type.support, styles.body, { color: palette.inkMuted }]}>{body}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  body: { textAlign: 'center', maxWidth: 320 },
  action: { marginTop: spacing.xl, alignSelf: 'stretch', maxWidth: 320 },
});
