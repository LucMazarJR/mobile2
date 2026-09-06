import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BarraSync from '@/components/BarraSync';
import EquipamentoCard from '@/components/EquipamentoCard';
import EstadoVazio from '@/components/EstadoVazio';
import { listarEquipamentos } from '@/db/equipamentos';
import type { EquipamentoComResumo } from '@/db/tipos';
import { useSync } from '@/services/SyncContext';
import { cores, espaco, raio } from '@/theme';

export default function ListaEquipamentos() {
  const db = useSQLiteContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sincronizarAgora, atualizarPendentes } = useSync();

  const [equipamentos, setEquipamentos] = useState<EquipamentoComResumo[]>([]);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    setEquipamentos(await listarEquipamentos(db));
    await atualizarPendentes();
  }, [db, atualizarPendentes]);

  // Recarrega toda vez que a tela volta ao foco (ex.: depois de cadastrar
  // um equipamento ou registrar uma manutenção).
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const aoPuxar = useCallback(async () => {
    setAtualizando(true);
    await sincronizarAgora();
    await carregar();
    setAtualizando(false);
  }, [sincronizarAgora, carregar]);

  return (
    <View style={estilos.tela}>
      <FlatList
        data={equipamentos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          estilos.conteudo,
          { paddingBottom: insets.bottom + 96 },
          equipamentos.length === 0 && estilos.conteudoVazio,
        ]}
        ListHeaderComponent={BarraSync}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoPuxar} />}
        ListEmptyComponent={
          <EstadoVazio
            titulo="Nenhum equipamento cadastrado"
            descricao="Cadastre o primeiro equipamento para começar a registrar o histórico de manutenções."
          />
        }
        renderItem={({ item }) => (
          <EquipamentoCard
            equipamento={item}
            onPress={() => router.push(`/equipamento/${item.id}`)}
          />
        )}
      />

      <Pressable
        onPress={() => router.push('/equipamento/novo')}
        style={({ pressed }) => [
          estilos.botaoFlutuante,
          { bottom: insets.bottom + espaco.lg },
          pressed && estilos.pressionado,
        ]}>
        <Text style={estilos.botaoFlutuanteTexto}>+ Novo equipamento</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg },
  conteudoVazio: { flexGrow: 1 },
  botaoFlutuante: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: cores.primaria,
    paddingHorizontal: espaco.xl,
    paddingVertical: espaco.md,
    borderRadius: raio.lg,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  botaoFlutuanteTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  pressionado: { opacity: 0.9 },
});
