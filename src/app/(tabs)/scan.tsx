import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import Field from '@/components/Field';
import { findEquipmentByCode } from '@/db/equipment';
import { useI18n } from '@/i18n';
import { parseTag } from '@/services/qr';
import { fonts, radius, spacing, type, usePalette } from '@/theme';

const FRAME = 252;
const CORNER = 36;

export default function Scan() {
  const db = useSQLiteContext();
  const router = useRouter();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(false);
  const [torch, setTorch] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [code, setCode] = useState('');

  // One QR stays in view for many frames; without the lock the same label would
  // be read and counted as a visit dozens of times a second.
  const locked = useRef(false);

  // The camera only runs while this tab is on screen: it saves battery and, on
  // Android, frees the camera for the OCR screen.
  useFocusEffect(
    useCallback(() => {
      locked.current = false;
      setProblem(null);
      setActive(true);
      return () => {
        setActive(false);
        setTorch(false);
      };
    }, [])
  );

  function openVisit(id: string) {
    router.push({ pathname: '/visit/[id]', params: { id } });
  }

  function handleScanned(data: string) {
    if (locked.current) return;
    locked.current = true;

    const tag = parseTag(data);
    if (!tag) {
      setProblem(t.scan.notRecognizedTitle);
      return;
    }

    if (tag.kind === 'id') openVisit(tag.id);
    else resolveCode(tag.code);
  }

  async function resolveCode(value: string) {
    const found = await findEquipmentByCode(db, value);
    if (found) {
      setTyping(false);
      setCode('');
      openVisit(found.id);
    } else {
      setProblem(t.scan.codeNotFound);
    }
  }

  function submitCode() {
    const tag = parseTag(code);
    locked.current = true;
    if (!tag) setProblem(t.scan.codeNotFound);
    else if (tag.kind === 'id') openVisit(tag.id);
    else void resolveCode(tag.code);
  }

  function retry() {
    locked.current = false;
    setProblem(null);
  }

  if (!permission) {
    return <View style={[styles.screen, { backgroundColor: palette.surfaceSunken }]} />;
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.permission,
          { backgroundColor: palette.surfaceSunken, paddingTop: insets.top + spacing.xl },
        ]}>
        <EmptyState
          icon="camera-outline"
          title={t.scan.permissionTitle}
          body={t.scan.permissionBody}
        />
        <Button
          label={permission.canAskAgain ? t.scan.allowCamera : t.scan.openSettings}
          icon="camera"
          variant="signal"
          onPress={() =>
            permission.canAskAgain ? requestPermission() : Linking.openSettings()
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {active ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={problem ? undefined : ({ data }) => handleScanned(data)}
        />
      ) : null}

      <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[type.section, { color: '#FFFFFF' }]}>{t.scan.title}</Text>
        <Pressable
          onPress={() => setTorch((current) => !current)}
          accessibilityRole="button"
          accessibilityState={{ selected: torch }}
          accessibilityLabel={t.scan.torch}
          hitSlop={10}
          style={[styles.torch, { backgroundColor: torch ? palette.signal : 'rgba(0,0,0,0.5)' }]}>
          <MaterialCommunityIcons
            name={torch ? 'flashlight' : 'flashlight-off'}
            size={22}
            color={torch ? '#161616' : '#FFFFFF'}
          />
        </Pressable>
      </View>

      <View style={styles.frameArea} pointerEvents="none">
        <View style={styles.frame}>
          <Corner position="tl" color={palette.signal} />
          <Corner position="tr" color={palette.signal} />
          <Corner position="bl" color={palette.signal} />
          <Corner position="br" color={palette.signal} />
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: spacing.lg }]}>
        {problem ? (
          <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.critical }]}>
            <View style={styles.panelHead}>
              <MaterialCommunityIcons name="qrcode-remove" size={22} color={palette.critical} />
              <Text style={[type.cardTitle, { color: palette.ink, flex: 1 }]}>{problem}</Text>
            </View>
            {problem === t.scan.notRecognizedTitle ? (
              <Text style={[type.support, { color: palette.inkMuted }]}>
                {t.scan.notRecognizedBody}
              </Text>
            ) : null}
            <Button label={t.scan.tryAgain} icon="qrcode-scan" onPress={retry} />
          </View>
        ) : typing ? (
          <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.ink }]}>
            <Field
              label={t.scan.codeLabel}
              value={code}
              onChangeText={setCode}
              placeholder={t.scan.codePlaceholder}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              containerStyle={styles.codeField}
              onSubmitEditing={submitCode}
            />
            <View style={styles.codeActions}>
              <Button label={t.scan.codeGo} onPress={submitCode} style={styles.grow} />
              <Button
                label={t.common.cancel}
                variant="secondary"
                onPress={() => {
                  setTyping(false);
                  setCode('');
                }}
                style={styles.grow}
              />
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.hint, { fontFamily: fonts.text }]}>{t.scan.hint}</Text>
            <Pressable
              onPress={() => setTyping(true)}
              accessibilityRole="button"
              style={styles.typeButton}>
              <MaterialCommunityIcons name="keyboard-outline" size={18} color="#FFFFFF" />
              <Text style={[type.supportStrong, { color: '#FFFFFF' }]}>{t.scan.typeCode}</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

function Corner({ position, color }: { position: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const top = position.startsWith('t');
  const left = position.endsWith('l');

  return (
    <View
      style={[
        styles.corner,
        {
          borderColor: color,
          top: top ? 0 : undefined,
          bottom: top ? undefined : 0,
          left: left ? 0 : undefined,
          right: left ? undefined : 0,
          borderTopWidth: top ? 5 : 0,
          borderBottomWidth: top ? 0 : 5,
          borderLeftWidth: left ? 5 : 0,
          borderRightWidth: left ? 0 : 5,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },
  permission: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  torch: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameArea: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  frame: { width: FRAME, height: FRAME },
  corner: { position: 'absolute', width: CORNER, height: CORNER },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  hint: { color: '#FFFFFF', fontSize: 15, textAlign: 'center' },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: radius.md,
  },
  panel: {
    alignSelf: 'stretch',
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  codeField: { marginBottom: 0 },
  codeActions: { flexDirection: 'row', gap: spacing.sm },
  grow: { flex: 1 },
});
