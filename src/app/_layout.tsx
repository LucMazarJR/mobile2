import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, useColorScheme } from 'react-native';

import { migrateDatabase } from '@/db/schema';
import { I18nProvider, useI18n } from '@/i18n';
import { BackupProvider } from '@/services/BackupContext';
import { fonts, usePalette } from '@/theme';

function Loading() {
  const palette = usePalette();
  return (
    <View style={[styles.loading, { backgroundColor: palette.surfaceSunken }]}>
      <ActivityIndicator color={palette.brand} />
    </View>
  );
}

function Navigator() {
  const palette = usePalette();
  const { t } = useI18n();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.surfaceSunken },
        headerTitleStyle: {
          color: palette.ink,
          fontFamily: fonts.display,
          fontSize: 24,
        },
        headerTintColor: palette.ink,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.surfaceSunken },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="visit/[id]" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen
        name="equipment/new"
        options={{ title: t.nav.newEquipment.toLocaleUpperCase(), presentation: 'modal' }}
      />
      <Stack.Screen name="equipment/[id]/index" options={{ title: t.nav.equipment.toLocaleUpperCase() }} />
      <Stack.Screen
        name="equipment/[id]/edit"
        options={{ title: t.nav.editEquipment.toLocaleUpperCase(), presentation: 'modal' }}
      />
      <Stack.Screen
        name="equipment/[id]/maintenance"
        options={{ title: t.nav.newMaintenance.toLocaleUpperCase(), presentation: 'modal' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
  });

  // A font can never be allowed to hold the app hostage. If it errors, or if it
  // simply never resolves, the screens go ahead on the system font.
  const [waitedLongEnough, setWaitedLongEnough] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaitedLongEnough(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !fontError && !waitedLongEnough) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      <SQLiteProvider databaseName="manutencao.db" onInit={migrateDatabase} useSuspense>
        <I18nProvider>
          <BackupProvider>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            <Navigator />
          </BackupProvider>
        </I18nProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
