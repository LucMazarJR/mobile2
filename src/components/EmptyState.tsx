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

// Left aligned and bare: an empty list should read like a blank line on a form,
// not like a centred illustration.
export default function EmptyState({ icon, title, body, actionLabel, onAction }: Props) {
  const palette = usePalette();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={44} color={palette.ink} />
      <View style={[styles.rule, { backgroundColor: palette.ink }]} />
      <Text style={[type.title, { color: palette.ink }]}>{title}</Text>
      <Text style={[type.body, styles.body, { color: palette.inkMuted }]}>{body}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xxl, paddingHorizontal: spacing.xs },
  rule: { height: 3, width: 40, marginTop: spacing.lg, marginBottom: spacing.md },
  body: { marginTop: spacing.sm, maxWidth: 340 },
  action: { marginTop: spacing.xl, alignSelf: 'flex-start', minWidth: 240 },
});
