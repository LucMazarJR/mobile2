import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import Field from '@/components/Field';
import type { NameplateFields } from '@/db/types';
import { useI18n } from '@/i18n';
import { isOcrAvailable, readText } from '@/services/ocr';
import { leaveOcrResult } from '@/services/ocrBridge';
import { radius, spacing, type, usePalette } from '@/theme';
import { parseNameplate } from '@/utils/nameplate';

type Step = 'camera' | 'reading' | 'review';
type Target = keyof NameplateFields;

const EMPTY: NameplateFields = { manufacturer: '', model: '', serialNumber: '' };

export default function ReadNameplate() {
  const router = useRouter();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<Step>('camera');
  const [lines, setLines] = useState<string[]>([]);
  const [fields, setFields] = useState<NameplateFields>(EMPTY);
  const [selected, setSelected] = useState<number | null>(null);
  const [nothing, setNothing] = useState(false);

  const screenOptions = (
    <Stack.Screen options={{ title: t.ocr.title.toLocaleUpperCase() }} />
  );

  if (!isOcrAvailable()) {
    return (
      <View style={[styles.padded, { backgroundColor: palette.surfaceSunken }]}>
        {screenOptions}
        <EmptyState
          icon="text-recognition"
          title={t.ocr.unavailableTitle}
          body={t.ocr.unavailableBody}
        />
        <Button label={t.common.close} variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  if (!permission) return <View style={{ flex: 1, backgroundColor: palette.surfaceSunken }} />;

  if (!permission.granted) {
    return (
      <View style={[styles.padded, { backgroundColor: palette.surfaceSunken }]}>
        {screenOptions}
        <EmptyState
          icon="camera-outline"
          title={t.scan.permissionTitle}
          body={t.scan.permissionBody}
        />
        <Button
          label={permission.canAskAgain ? t.scan.allowCamera : t.scan.openSettings}
          icon="camera"
          variant="signal"
          onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
        />
      </View>
    );
  }

  async function capture() {
    if (!ready || !cameraRef.current) return;

    setStep('reading');
    setNothing(false);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      const found = await readText(photo.uri);

      setLines(found);
      setFields(parseNameplate(found));
      setSelected(null);
      setNothing(found.length === 0);
      setStep('review');
    } catch (error) {
      console.error('[ocr] could not read the photo', error);
      Alert.alert(t.ocr.failedTitle, t.ocr.failedBody);
      setStep('camera');
    }
  }

  function sendLineTo(target: Target) {
    if (selected === null) return;
    setFields((current) => ({ ...current, [target]: lines[selected] }));
    setSelected(null);
  }

  function confirm() {
    leaveOcrResult({ fields, rawText: lines.join('\n') });
    router.back();
  }

  if (step === 'review') {
    return (
      <ScrollView
        style={{ backgroundColor: palette.surfaceSunken }}
        contentContainerStyle={[styles.review, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled">
        {screenOptions}

        {nothing ? (
          <EmptyState
            icon="text-recognition"
            title={t.ocr.nothingTitle}
            body={t.ocr.nothingBody}
          />
        ) : (
          <>
            <Text style={[type.title, { color: palette.ink }]}>{t.ocr.reviewTitle}</Text>

            <Field
              label={t.equipmentForm.manufacturer}
              value={fields.manufacturer}
              onChangeText={(value) => setFields((c) => ({ ...c, manufacturer: value }))}
              containerStyle={styles.firstField}
            />
            <Field
              label={t.equipmentForm.model}
              value={fields.model}
              onChangeText={(value) => setFields((c) => ({ ...c, model: value }))}
            />
            <Field
              label={t.equipmentForm.serialNumber}
              value={fields.serialNumber}
              autoCapitalize="characters"
              onChangeText={(value) => setFields((c) => ({ ...c, serialNumber: value }))}
            />

            <Text style={[type.section, { color: palette.inkMuted }]}>{t.ocr.readText}</Text>
            <Text style={[type.support, styles.reviewHint, { color: palette.inkMuted }]}>
              {t.ocr.reviewHint}
            </Text>

            <View style={[styles.lines, { borderColor: palette.ink, backgroundColor: palette.surface }]}>
              {lines.map((line, index) => {
                const active = selected === index;
                return (
                  <Pressable
                    key={`${index}-${line}`}
                    onPress={() => setSelected(active ? null : index)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.line,
                      { borderBottomColor: palette.line },
                      active && { backgroundColor: palette.signal },
                    ]}>
                    <Text
                      style={[type.mono, { color: active ? palette.onSignal : palette.ink, flex: 1 }]}>
                      {line}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selected !== null ? (
              <View style={styles.targets}>
                <Text style={[type.micro, { color: palette.inkMuted }]}>{t.ocr.putIn}</Text>
                <View style={styles.targetRow}>
                  <TargetButton
                    label={t.equipmentForm.manufacturer}
                    onPress={() => sendLineTo('manufacturer')}
                  />
                  <TargetButton label={t.equipmentForm.model} onPress={() => sendLineTo('model')} />
                  <TargetButton
                    label={t.equipmentForm.serialNumber}
                    onPress={() => sendLineTo('serialNumber')}
                  />
                </View>
              </View>
            ) : null}
          </>
        )}

        <View style={styles.actions}>
          {!nothing ? (
            <Button label={t.ocr.useData} icon="check" onPress={confirm} />
          ) : null}
          <Button
            label={t.ocr.retake}
            icon="camera"
            variant="secondary"
            onPress={() => setStep('camera')}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.camera}>
      {screenOptions}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setReady(true)}
      />

      <View style={styles.guideArea} pointerEvents="none">
        <View style={[styles.guide, { borderColor: palette.signal }]} />
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.lg }]}>
        {step === 'reading' ? (
          <View style={styles.reading}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={[type.section, { color: '#FFFFFF' }]}>{t.ocr.reading}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.hint}>{t.ocr.hint}</Text>
            <Pressable
              onPress={capture}
              disabled={!ready}
              accessibilityRole="button"
              accessibilityLabel={t.ocr.capture}
              style={({ pressed }) => [
                styles.shutter,
                { borderColor: '#FFFFFF', opacity: ready ? (pressed ? 0.7 : 1) : 0.4 },
              ]}>
              <View style={[styles.shutterCore, { backgroundColor: palette.signal }]}>
                <MaterialCommunityIcons name="text-recognition" size={28} color="#161616" />
              </View>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

function TargetButton({ label, onPress }: { label: string; onPress: () => void }) {
  const palette = usePalette();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.target,
        { borderColor: palette.ink, backgroundColor: palette.surface },
        pressed && { opacity: 0.7 },
      ]}>
      <Text style={[type.supportStrong, { color: palette.ink }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  padded: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  camera: { flex: 1, backgroundColor: '#000000' },
  guideArea: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  guide: { width: '86%', aspectRatio: 1.7, borderWidth: 3, borderRadius: radius.md },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  hint: { color: '#FFFFFF', fontSize: 15, textAlign: 'center' },
  reading: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 76 },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  review: { padding: spacing.lg },
  firstField: { marginTop: spacing.lg },
  reviewHint: { marginTop: spacing.xs, marginBottom: spacing.md },
  lines: { borderWidth: 1.5, borderRadius: radius.sm },
  line: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  targets: { marginTop: spacing.md, gap: spacing.xs },
  targetRow: { flexDirection: 'row', gap: spacing.sm },
  target: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
  },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
});
