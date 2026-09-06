import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import Botao from '@/components/Botao';
import Campo from '@/components/Campo';
import { criarEquipamento } from '@/db/equipamentos';
import { useSync } from '@/services/SyncContext';
import { cores, espaco } from '@/theme';

export default function NovoEquipamento() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { sincronizarAgora } = useSync();

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [intervalo, setIntervalo] = useState('30');
  const [erros, setErros] = useState<{ nome?: string; intervalo?: string }>({});
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const intervaloDias = Number(intervalo);
    const novosErros: typeof erros = {};

    if (!nome.trim()) novosErros.nome = 'Informe o nome do equipamento.';
    if (!Number.isInteger(intervaloDias) || intervaloDias <= 0) {
      novosErros.intervalo = 'Informe um número de dias maior que zero.';
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);

    // Grava primeiro no SQLite: é isso que faz o cadastro funcionar mesmo
    // sem internet. O envio ao Supabase é só uma tentativa oportunista.
    await criarEquipamento(db, {
      nome: nome.trim(),
      categoria: categoria.trim(),
      localizacao: localizacao.trim(),
      intervaloDias,
    });

    sincronizarAgora();
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={estilos.explicacao}>
          O equipamento é salvo no aparelho na hora. Assim que houver conexão, ele é enviado
          automaticamente para o Supabase.
        </Text>

        <Campo
          rotulo="Nome *"
          value={nome}
          onChangeText={setNome}
          placeholder="Ex.: Extintor do corredor B"
          erro={erros.nome}
          autoFocus
        />

        <Campo
          rotulo="Categoria"
          value={categoria}
          onChangeText={setCategoria}
          placeholder="Ex.: Extintor, Ar-condicionado, Gerador"
        />

        <Campo
          rotulo="Localização"
          value={localizacao}
          onChangeText={setLocalizacao}
          placeholder="Ex.: Bloco A - 2º andar"
        />

        <Campo
          rotulo="Intervalo de manutenção (dias) *"
          value={intervalo}
          onChangeText={setIntervalo}
          keyboardType="number-pad"
          placeholder="30"
          dica="Usado para calcular se a manutenção está em dia ou atrasada."
          erro={erros.intervalo}
        />

        <View style={estilos.acoes}>
          <Botao titulo="Salvar equipamento" onPress={salvar} carregando={salvando} />
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
  explicacao: {
    fontSize: 13,
    color: cores.textoFraco,
    lineHeight: 19,
    marginBottom: espaco.lg,
  },
  acoes: { gap: espaco.sm, marginTop: espaco.sm },
});
