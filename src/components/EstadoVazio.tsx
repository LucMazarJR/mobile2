import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco } from '@/theme';

type Props = {
  titulo: string;
  descricao: string;
};

export default function EstadoVazio({ titulo, descricao }: Props) {
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.descricao}>{descricao}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: espaco.xl * 2, paddingHorizontal: espaco.lg },
  titulo: { fontSize: 15, fontWeight: '700', color: cores.texto, marginBottom: espaco.sm },
  descricao: { fontSize: 13, color: cores.textoFraco, textAlign: 'center', lineHeight: 19 },
});
