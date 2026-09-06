import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Botao from '@/components/Botao';
import EstadoVazio from '@/components/EstadoVazio';
import ManutencaoItem from '@/components/ManutencaoItem';
import { buscarEquipamento, excluirEquipamento } from '@/db/equipamentos';
import { listarManutencoes } from '@/db/manutencoes';
import type { EquipamentoComResumo, Manutencao } from '@/db/tipos';
import { useSync } from '@/services/SyncContext';
import { cores, espaco, raio } from '@/theme';
import { calcularStatus, formatarData } from '@/utils/status';

export default function DetalheEquipamento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { atualizarPendentes, revisao } = useSync();

  const [equipamento, setEquipamento] = useState<EquipamentoComResumo | null>(null);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [carregado, setCarregado] = useState(false);

  const carregar = useCallback(async () => {
    const registro = await buscarEquipamento(db, id);
    setEquipamento(registro);
    setManutencoes(registro ? await listarManutencoes(db, id) : []);
    setCarregado(true);
    await atualizarPendentes();
  }, [db, id, atualizarPendentes]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  // Mesmo motivo da lista: depois do envio o histórico precisa ser relido para
  // as manutenções deixarem de aparecer como "pendente".
  useEffect(() => {
    if (revisao === 0) return;
    carregar();
  }, [revisao, carregar]);

  function confirmarExclusao() {
    Alert.alert(
      'Excluir equipamento',
      'O equipamento e todo o histórico de manutenções dele serão apagados deste aparelho. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await excluirEquipamento(db, id);
            router.back();
          },
        },
      ]
    );
  }

  if (!carregado) return <View style={estilos.tela} />;

  if (!equipamento) {
    return (
      <View style={estilos.tela}>
        <EstadoVazio
          titulo="Equipamento não encontrado"
          descricao="Este registro pode ter sido excluído do aparelho."
        />
      </View>
    );
  }

  const status = calcularStatus(equipamento);

  return (
    <View style={estilos.tela}>
      <Stack.Screen options={{ title: equipamento.nome }} />

      <FlatList
        data={manutencoes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[estilos.conteudo, { paddingBottom: insets.bottom + espaco.xl }]}
        ListHeaderComponent={
          <View>
            <View style={estilos.ficha}>
              <View style={[estilos.selo, { backgroundColor: status.fundo }]}>
                <Text style={[estilos.seloTexto, { color: status.cor }]}>{status.rotulo}</Text>
              </View>

              <Linha rotulo="Categoria" valor={equipamento.categoria || '—'} />
              <Linha rotulo="Localização" valor={equipamento.localizacao || '—'} />
              <Linha rotulo="Intervalo" valor={`A cada ${equipamento.intervalo_dias} dias`} />
              <Linha
                rotulo="Última manutenção"
                valor={formatarData(equipamento.ultima_manutencao)}
              />
              <Linha
                rotulo="Próxima prevista"
                valor={formatarData(status.proxima.toISOString())}
              />
              <Linha rotulo="Total registrado" valor={`${equipamento.total_manutencoes}`} />
            </View>

            <Botao
              titulo="Registrar manutenção"
              onPress={() => router.push(`/equipamento/${id}/nova-manutencao`)}
              style={estilos.botaoPrincipal}
            />

            <Text style={estilos.tituloSecao}>Histórico</Text>
          </View>
        }
        ListEmptyComponent={
          <EstadoVazio
            titulo="Nenhuma manutenção registrada"
            descricao="Assim que a primeira manutenção for registrada, ela aparece aqui em ordem cronológica."
          />
        }
        renderItem={({ item }) => <ManutencaoItem manutencao={item} />}
        ListFooterComponent={
          <Botao
            titulo="Excluir equipamento"
            variante="perigo"
            onPress={confirmarExclusao}
            style={estilos.botaoExcluir}
          />
        }
      />
    </View>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.linhaRotulo}>{rotulo}</Text>
      <Text style={estilos.linhaValor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg },
  ficha: {
    backgroundColor: cores.cartao,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
  },
  selo: {
    alignSelf: 'flex-start',
    paddingHorizontal: espaco.sm,
    paddingVertical: 4,
    borderRadius: raio.sm,
    marginBottom: espaco.md,
  },
  seloTexto: { fontSize: 11, fontWeight: '700' },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espaco.md,
    paddingVertical: espaco.sm,
  },
  linhaRotulo: { fontSize: 13, color: cores.textoFraco },
  linhaValor: { flex: 1, fontSize: 13, fontWeight: '600', color: cores.texto, textAlign: 'right' },
  botaoPrincipal: { marginTop: espaco.lg },
  tituloSecao: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.texto,
    marginTop: espaco.xl,
    marginBottom: espaco.md,
  },
  botaoExcluir: { marginTop: espaco.lg },
});
