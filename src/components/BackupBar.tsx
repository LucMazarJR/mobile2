import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';

import { useI18n } from '@/i18n';
import { useBackup } from '@/services/BackupContext';
import { radius, spacing, type, usePalette } from '@/theme';
import { formatTime } from '@/utils/status';

// Tells the person using the app whether their work has a copy in the cloud.
// It is deliberately quiet when everything is fine and only speaks up when
// something is waiting or went wrong.
export default function BackupBar() {
  const palette = usePalette();
  const router = useRouter();
  const { t, locale } = useI18n();
  const { state, pending, lastUpload, uploadNow } = useBackup();

  const parts: Record<
    string,
    { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; fg: string; bg: string; title: string; body?: string; action?: string }
  > = {
    saved: {
      icon: 'cloud-check-outline',
      fg: palette.ok,
      bg: palette.okWash,
      title: t.backup.allSaved,
      body: lastUpload ? t.backup.allSavedAt(formatTime(lastUpload, locale)) : undefined,
    },
    uploading: {
      icon: 'cloud-upload-outline',
      fg: palette.brand,
      bg: palette.brandWash,
      title: t.backup.sending,
    },
    pending: {
      icon: 'cloud-upload-outline',
      fg: palette.warning,
      bg: palette.warningWash,
      title: t.backup.pendingTitle(pending.equipment, pending.maintenance),
      action: t.backup.sendNow,
    },
    offline: {
      icon: 'wifi-off',
      fg: palette.inkMuted,
      bg: palette.neutralWash,
      title: t.backup.offlineTitle,
      body: t.backup.offlineBody,
    },
    failed: {
      icon: 'cloud-alert',
      fg: palette.critical,
      bg: palette.criticalWash,
      title: t.backup.failedTitle,
      body: t.backup.failedBody,
      action: t.common.retry,
    },
    disabled: {
      icon: 'cloud-off-outline',
      fg: palette.inkMuted,
      bg: palette.neutralWash,
      title: t.backup.disabledTitle,
      body: t.backup.disabledBody,
      action: t.backup.learnMore,
    },
  };

  const current = parts[state];
  const actionable = state === 'pending' || state === 'failed';

  function handlePress() {
    if (actionable) uploadNow();
    else router.push('/about');
  }

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      entering={FadeInDown.duration(220)}
      exiting={FadeOutUp.duration(180)}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${current.title}${current.body ? `. ${current.body}` : ''}`}
        style={({ pressed }) => [
          styles.bar,
          { backgroundColor: current.bg },
          pressed && styles.pressed,
        ]}>
        {state === 'uploading' ? (
          <ActivityIndicator size="small" color={current.fg} />
        ) : (
          <MaterialCommunityIcons name={current.icon} size={18} color={current.fg} />
        )}

        <View style={styles.text}>
          <Text style={[type.supportStrong, { color: current.fg }]} numberOfLines={1}>
            {current.title}
          </Text>
          {current.body ? (
            <Text style={[type.support, { color: current.fg, opacity: 0.85 }]} numberOfLines={1}>
              {current.body}
            </Text>
          ) : null}
        </View>

        {current.action ? (
          <Text style={[type.micro, { color: current.fg }]}>{current.action}</Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    minHeight: 48,
  },
  pressed: { opacity: 0.8 },
  text: { flex: 1 },
});
