import { StyleSheet, Text, View } from 'react-native';

import type { Manutencao } from '@/db/tipos';
import { cores, espaco, raio } from '@/theme';
import { formatarData } from '@/utils/status';

export default function ManutencaoItem({ manutencao }: { manutencao: Manutencao }) {
  const preventiva = manutencao.tipo === 'preventiva';

  return (
    <View style={estilos.item}>
      <View style={estilos.linhaTopo}>
        <View
          style={[
            estilos.selo,
            { backgroundColor: preventiva ? cores.primariaFraca : cores.avisoFraco },
          ]}>
          <Text style={[estilos.seloTexto, { color: preventiva ? cores.primaria : cores.aviso }]}>
            {preventiva ? 'Preventiva' : 'Corretiva'}
          </Text>
        </View>
        <Text style={estilos.data}>{formatarData(manutencao.data)}</Text>
      </View>

      {manutencao.descricao ? <Text style={estilos.descricao}>{manutencao.descricao}</Text> : null}

      <View style={estilos.rodape}>
        <Text style={estilos.responsavel}>
          {manutencao.responsavel || 'Responsável não informado'}
        </Text>
        {manutencao.synced === 0 ? <Text style={estilos.pendente}>pendente</Text> : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  item: {
    backgroundColor: cores.cartao,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.md,
    marginBottom: espaco.sm,
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selo: { paddingHorizontal: espaco.sm, paddingVertical: 3, borderRadius: raio.sm },
  seloTexto: { fontSize: 11, fontWeight: '700' },
  data: { fontSize: 12, fontWeight: '600', color: cores.textoFraco },
  descricao: { fontSize: 14, color: cores.texto, marginTop: espaco.sm, lineHeight: 20 },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espaco.sm,
  },
  responsavel: { fontSize: 12, color: cores.textoFraco },
  pendente: { fontSize: 11, fontWeight: '600', color: cores.aviso },
});
