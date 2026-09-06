import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Botao from '@/components/Botao';
import Campo from '@/components/Campo';
import { criarManutencao } from '@/db/manutencoes';
import type { TipoManutencao } from '@/db/tipos';
import { useSync } from '@/services/SyncContext';
import { cores, espaco, raio } from '@/theme';
import { dataBrParaISO, hojeBr } from '@/utils/status';

const TIPOS: { valor: TipoManutencao; rotulo: string; descricao: string }[] = [
  { valor: 'preventiva', rotulo: 'Preventiva', descricao: 'Revisão programada' },
  { valor: 'corretiva', rotulo: 'Corretiva', descricao: 'Conserto de falha' },
];

export default function NovaManutencao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const { sincronizarAgora } = useSync();

  const [tipo, setTipo] = useState<TipoManutencao>('preventiva');
  const [descricao, setDescricao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [data, setData] = useState(hojeBr());
  const [erroData, setErroData] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const dataISO = dataBrParaISO(data);

    if (!dataISO) {
      setErroData('Use o formato DD/MM/AAAA.');
      return;
    }

    setErroData(null);
    setSalvando(true);

    await criarManutencao(db, {
      equipamentoId: id,
      tipo,
      descricao: descricao.trim(),
      responsavel: responsavel.trim(),
      data: dataISO,
    });

    sincronizarAgora();
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={estilos.rotulo}>Tipo de manutenção</Text>
        <View style={estilos.opcoes}>
          {TIPOS.map((opcao) => {
            const ativo = tipo === opcao.valor;
            return (
              <Pressable
                key={opcao.valor}
                onPress={() => setTipo(opcao.valor)}
                style={[estilos.opcao, ativo && estilos.opcaoAtiva]}>
                <Text style={[estilos.opcaoTitulo, ativo && estilos.opcaoTituloAtivo]}>
                  {opcao.rotulo}
                </Text>
                <Text style={[estilos.opcaoDescricao, ativo && estilos.opcaoDescricaoAtiva]}>
                  {opcao.descricao}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Campo
          rotulo="Data"
          value={data}
          onChangeText={setData}
          placeholder="DD/MM/AAAA"
          keyboardType="numbers-and-punctuation"
          erro={erroData}
        />

        <Campo
          rotulo="Descrição do serviço"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Ex.: Troca de filtro e limpeza do sistema"
          multiline
        />

        <Campo
          rotulo="Responsável"
          value={responsavel}
          onChangeText={setResponsavel}
          placeholder="Quem executou o serviço"
        />

        <View style={estilos.acoes}>
          <Botao titulo="Salvar manutenção" onPress={salvar} carregando={salvando} />
          <Botao
            titulo="Cancelar"
            variante="secundaria"
            onPress={() => router.back()}
            desabilitado={salvando}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, paddingBottom: espaco.xl * 2 },
  rotulo: { fontSize: 13, fontWeight: '600', color: cores.texto, marginBottom: espaco.sm },
  opcoes: { flexDirection: 'row', gap: espaco.sm, marginBottom: espaco.lg },
  opcao: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.md,
    padding: espaco.md,
  },
  opcaoAtiva: { borderColor: cores.primaria, backgroundColor: cores.primariaFraca },
  opcaoTitulo: { fontSize: 14, fontWeight: '700', color: cores.texto },
  opcaoTituloAtivo: { color: cores.primaria },
  opcaoDescricao: { fontSize: 12, color: cores.textoFraco, marginTop: 2 },
  opcaoDescricaoAtiva: { color: cores.primaria },
  acoes: { gap: espaco.sm, marginTop: espaco.sm },
});
