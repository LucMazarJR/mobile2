import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { cores, espaco, raio } from '@/theme';

type BotaoProps = {
  titulo: string;
  onPress?: () => void;
  variante?: 'primaria' | 'secundaria' | 'perigo';
  carregando?: boolean;
  desabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Botao({
  titulo,
  onPress,
  variante = 'primaria',
  carregando = false,
  desabilitado = false,
  style,
}: BotaoProps) {
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      style={({ pressed }) => [
        estilos.base,
        variante === 'primaria' && estilos.primaria,
        variante === 'secundaria' && estilos.secundaria,
        variante === 'perigo' && estilos.perigo,
        pressed && !inativo && estilos.pressionado,
        inativo && estilos.inativo,
        style,
      ]}>
      {carregando ? (
        <ActivityIndicator color={variante === 'primaria' ? '#FFFFFF' : cores.primaria} />
      ) : (
        <Text
          style={[
            estilos.texto,
            variante === 'primaria' && estilos.textoPrimaria,
            variante === 'secundaria' && estilos.textoSecundaria,
            variante === 'perigo' && estilos.textoPerigo,
          ]}>
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: raio.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espaco.lg,
  },
  primaria: { backgroundColor: cores.primaria },
  secundaria: { backgroundColor: cores.cartao, borderWidth: 1, borderColor: cores.borda },
  perigo: { backgroundColor: cores.alertaFraco },
  pressionado: { opacity: 0.85 },
  inativo: { opacity: 0.5 },
  texto: { fontSize: 15, fontWeight: '600' },
  textoPrimaria: { color: '#FFFFFF' },
  textoSecundaria: { color: cores.texto },
  textoPerigo: { color: cores.alerta },
});
