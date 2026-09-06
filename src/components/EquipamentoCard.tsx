import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { EquipamentoComResumo } from '@/db/tipos';
import { cores, espaco, raio } from '@/theme';
import { calcularStatus, formatarData } from '@/utils/status';

type Props = {
  equipamento: EquipamentoComResumo;
  onPress: () => void;
};

export default function EquipamentoCard({ equipamento, onPress }: Props) {
  const status = calcularStatus(equipamento);
  const pendente = equipamento.synced === 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.nome} numberOfLines={1}>
          {equipamento.nome}
        </Text>
        <View style={[estilos.selo, { backgroundColor: status.fundo }]}>
          <Text style={[estilos.seloTexto, { color: status.cor }]}>{status.rotulo}</Text>
        </View>
      </View>

      <Text style={estilos.subtitulo} numberOfLines={1}>
        {[equipamento.categoria, equipamento.localizacao].filter(Boolean).join(' · ') ||
          'Sem categoria ou local definido'}
      </Text>

      <View style={estilos.rodape}>
        <Text style={estilos.info}>
          Última manutenção: {formatarData(equipamento.ultima_manutencao)}
        </Text>
        {pendente ? <Text style={estilos.pendente}>não sincronizado</Text> : null}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    marginBottom: espaco.md,
  },
  pressionado: { opacity: 0.7 },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.sm,
  },
  nome: { flex: 1, fontSize: 16, fontWeight: '700', color: cores.texto },
  selo: { paddingHorizontal: espaco.sm, paddingVertical: 4, borderRadius: raio.sm },
  seloTexto: { fontSize: 11, fontWeight: '700' },
  subtitulo: { fontSize: 13, color: cores.textoFraco, marginTop: espaco.xs },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espaco.md,
    gap: espaco.sm,
  },
  info: { fontSize: 12, color: cores.textoFraco },
  pendente: { fontSize: 11, fontWeight: '600', color: cores.aviso },
});
