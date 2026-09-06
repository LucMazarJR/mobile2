import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSync } from '@/services/SyncContext';
import { cores, espaco, raio } from '@/theme';

// Faixa fina no topo da lista mostrando o estado da sincronização.
// Serve de feedback para o usuário e, na apresentação, de prova visual de que
// os dados saíram do SQLite local e chegaram ao Supabase.
export default function BarraSync() {
  const { pendentes, sincronizando, ultimoErro, configurado, sincronizarAgora } = useSync();

  if (!configurado) {
    return (
      <View style={[estilos.barra, estilos.aviso]}>
        <Text style={estilos.textoAviso}>
          Supabase não configurado — preencha o arquivo .env para ativar o envio online.
        </Text>
      </View>
    );
  }

  if (ultimoErro) {
    return (
      <Pressable onPress={sincronizarAgora} style={[estilos.barra, estilos.erro]}>
        <Text style={estilos.textoErro} numberOfLines={2}>
          Falha ao sincronizar: {ultimoErro}
        </Text>
        <Text style={estilos.acaoErro}>Tentar novamente</Text>
      </Pressable>
    );
  }

  if (pendentes === 0) {
    return (
      <View style={[estilos.barra, estilos.ok]}>
        <Text style={estilos.textoOk}>Tudo sincronizado com o Supabase</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={sincronizarAgora}
      disabled={sincronizando}
      style={[estilos.barra, estilos.pendente]}>
      <Text style={estilos.textoPendente}>
        {pendentes} {pendentes === 1 ? 'registro aguardando' : 'registros aguardando'} envio
      </Text>
      {sincronizando ? (
        <ActivityIndicator size="small" color={cores.aviso} />
      ) : (
        <Text style={estilos.acao}>Sincronizar</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.sm,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
    borderRadius: raio.md,
    marginBottom: espaco.md,
  },
  ok: { backgroundColor: cores.sucessoFraco },
  textoOk: { fontSize: 12, fontWeight: '600', color: cores.sucesso },
  pendente: { backgroundColor: cores.avisoFraco },
  textoPendente: { flex: 1, fontSize: 12, fontWeight: '600', color: cores.aviso },
  acao: { fontSize: 12, fontWeight: '700', color: cores.aviso },
  aviso: { backgroundColor: cores.primariaFraca },
  textoAviso: { flex: 1, fontSize: 12, color: cores.primaria },
  erro: { backgroundColor: cores.alertaFraco },
  textoErro: { flex: 1, fontSize: 12, color: cores.alerta },
  acaoErro: { fontSize: 12, fontWeight: '700', color: cores.alerta },
});
