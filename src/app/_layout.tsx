import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { migrarBanco } from '@/db/schema';
import { SyncProvider } from '@/services/SyncContext';
import { cores } from '@/theme';

function Carregando() {
  return (
    <View style={estilos.carregando}>
      <ActivityIndicator color={cores.primaria} />
    </View>
  );
}

export default function RootLayout() {
  return (
    // O banco é aberto e migrado antes de qualquer tela aparecer; enquanto isso
    // o Suspense mostra o indicador de carregamento.
    <Suspense fallback={<Carregando />}>
      <SQLiteProvider databaseName="manutencao.db" onInit={migrarBanco} useSuspense>
        <SyncProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: cores.cartao },
              headerTitleStyle: { color: cores.texto, fontSize: 17, fontWeight: '700' },
              headerTintColor: cores.primaria,
              contentStyle: { backgroundColor: cores.fundo },
            }}>
            <Stack.Screen name="index" options={{ title: 'Equipamentos' }} />
            <Stack.Screen
              name="equipamento/novo"
              options={{ title: 'Novo equipamento', presentation: 'modal' }}
            />
            <Stack.Screen name="equipamento/[id]/index" options={{ title: 'Equipamento' }} />
            <Stack.Screen
              name="equipamento/[id]/nova-manutencao"
              options={{ title: 'Nova manutenção', presentation: 'modal' }}
            />
          </Stack>
        </SyncProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

const estilos = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
});
