import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View, useColorScheme } from 'react-native';

import { migrateDatabase } from '@/db/schema';
import { I18nProvider, useI18n } from '@/i18n';
import { BackupProvider } from '@/services/BackupContext';
import { usePalette } from '@/theme';

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
        headerStyle: { backgroundColor: palette.surface },
        headerTitleStyle: { color: palette.ink, fontFamily: 'Inter_600SemiBold', fontSize: 17 },
        headerTintColor: palette.brand,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.surfaceSunken },
      }}>
      <Stack.Screen name="index" options={{ title: t.nav.home }} />
      <Stack.Screen name="about" options={{ title: t.nav.about, presentation: 'modal' }} />
      <Stack.Screen
        name="equipment/new"
        options={{ title: t.nav.newEquipment, presentation: 'modal' }}
      />
      <Stack.Screen name="equipment/[id]/index" options={{ title: t.nav.equipment }} />
      <Stack.Screen
        name="equipment/[id]/edit"
        options={{ title: t.nav.editEquipment, presentation: 'modal' }}
      />
      <Stack.Screen
        name="equipment/[id]/maintenance"
        options={{ title: t.nav.newMaintenance, presentation: 'modal' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();

  // A font must never be able to hang the app: if it fails to load, the screens
  // render on the system font instead.
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded && !fontError) return <Loading />;

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
