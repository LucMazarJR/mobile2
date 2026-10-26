import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { databaseVersion } from '@/db/schema';
import { LANGUAGES, LANGUAGE_NAMES, useI18n, type Language } from '@/i18n';
import { useBackup } from '@/services/BackupContext';
import { cloudHost } from '@/services/supabase';
import { radius, spacing, tabular, type, usePalette } from '@/theme';
import { formatTime } from '@/utils/status';

// Everything written for developers lives here, and nowhere else in the app.
// It doubles as the place to show that the cloud connection is real.
export default function About() {
  const db = useSQLiteContext();
  const palette = usePalette();
  const { t, locale, language, setLanguage } = useI18n();
  const { pending, pendingTotal, lastUpload, lastErrorDetail, uploadNow, fetchFromCloud } =
    useBackup();

  const [version, setVersion] = useState<number | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    databaseVersion(db).then(setVersion).catch(() => setVersion(null));
  }, [db]);

  async function handleFetch() {
    setBusy(true);
    const count = await fetchFromCloud();
    setFetchMessage(t.about.fetched(count));
    setBusy(false);
  }

  return (
    <ScrollView
      style={{ backgroundColor: palette.surfaceSunken }}
      contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.line }]}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="shield-check-outline" size={22} color={palette.brand} />
          <Text style={[type.cardTitle, { color: palette.ink, flex: 1 }]}>
            {t.about.howItWorksTitle}
          </Text>
        </View>
        <Text style={[type.body, { color: palette.inkMuted }]}>{t.about.howItWorksBody}</Text>
      </View>

      <SectionTitle title={t.about.statusTitle} />

      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.line }]}>
        <Row
          label={t.about.techPending}
          value={String(pendingTotal)}
          color={pendingTotal > 0 ? palette.warning : palette.ok}
        />
        <Row
          label={t.backup.allSaved}
          value={lastUpload ? formatTime(lastUpload, locale) : t.common.none}
        />

        <View style={styles.actions}>
          <Button
            label={t.about.sendNow}
            icon="cloud-upload-outline"
            onPress={() => uploadNow()}
            disabled={busy}
          />
          <Button
            label={t.about.fetchFromCloud}
            variant="secondary"
            icon="cloud-download-outline"
            onPress={handleFetch}
            loading={busy}
          />
        </View>

        {fetchMessage ? (
          <Text style={[type.support, styles.fetchMessage, { color: palette.inkMuted }]}>
            {fetchMessage}
          </Text>
        ) : null}
      </View>

      <SectionTitle title={t.about.languageTitle} />

      <View style={styles.languages}>
        {LANGUAGES.map((option: Language) => {
          const selected = language === option;
          return (
            <Pressable
              key={option}
              onPress={() => setLanguage(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.language,
                {
                  backgroundColor: selected ? palette.brand : palette.surface,
                  borderColor: selected ? palette.brand : palette.line,
                },
              ]}>
              <Text
                style={[
                  type.bodyStrong,
                  { color: selected ? palette.onBrand : palette.inkMuted },
                ]}>
                {LANGUAGE_NAMES[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => setShowTechnical((current) => !current)}
        accessibilityRole="button"
        style={styles.technicalToggle}>
        <Text style={[type.section, { color: palette.inkFaint }]}>{t.about.technicalTitle}</Text>
        <Text style={[type.micro, { color: palette.brand }]}>
          {showTechnical ? t.about.technicalHide : t.about.technicalShow}
        </Text>
      </Pressable>

      {showTechnical ? (
        <View
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.line }]}>
          <Row label={t.about.techCloud} value={cloudHost ?? t.about.techCloudOff} mono />
          <Row label={t.about.techLocalDb} value="manutencao.db" mono />
          <Row label={t.about.techVersion} value={version === null ? '-' : `v${version}`} mono />
          <Row label="equipment" value={String(pending.equipment)} mono />
          <Row label="maintenance" value={String(pending.maintenance)} mono />
          <Row
            label={t.about.techLastError}
            value={lastErrorDetail ?? t.about.techNoError}
            mono
            wrap
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

function Row({
  label,
  value,
  color,
  mono = false,
  wrap = false,
}: {
  label: string;
  value: string;
  color?: string;
  mono?: boolean;
  wrap?: boolean;
}) {
  const palette = usePalette();

  return (
    <View style={[styles.row, wrap && styles.rowWrap]}>
      <Text style={[type.support, { color: palette.inkMuted }]}>{label}</Text>
      <Text
        style={[
          mono ? type.mono : type.supportStrong,
          tabular,
          wrap ? styles.valueWrap : styles.value,
          { color: color ?? palette.ink },
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowWrap: { flexDirection: 'column', gap: 2 },
  value: { flex: 1, textAlign: 'right' },
  valueWrap: { textAlign: 'left' },
  actions: { gap: spacing.sm, marginTop: spacing.md },
  fetchMessage: { marginTop: spacing.sm, textAlign: 'center' },
  languages: { flexDirection: 'row', gap: spacing.sm },
  language: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  technicalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});
