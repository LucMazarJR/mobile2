import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { cores, espaco, raio } from '@/theme';

type CampoProps = Omit<TextInputProps, 'style'> & {
  rotulo: string;
  dica?: string;
  erro?: string | null;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function Campo({ rotulo, dica, erro, containerStyle, ...props }: CampoProps) {
  return (
    <View style={[estilos.container, containerStyle]}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        placeholderTextColor={cores.textoFraco}
        style={[estilos.input, erro && estilos.inputErro, props.multiline && estilos.multiline]}
        {...props}
      />
      {erro ? (
        <Text style={estilos.erro}>{erro}</Text>
      ) : dica ? (
        <Text style={estilos.dica}>{dica}</Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { marginBottom: espaco.lg },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.texto,
    marginBottom: espaco.sm,
  },
  input: {
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.md,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.md,
    fontSize: 15,
    color: cores.texto,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  inputErro: { borderColor: cores.alerta },
  dica: { fontSize: 12, color: cores.textoFraco, marginTop: espaco.xs },
  erro: { fontSize: 12, color: cores.alerta, marginTop: espaco.xs },
});
