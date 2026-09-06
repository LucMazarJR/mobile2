import * as Crypto from 'expo-crypto';

// O id é gerado no aparelho (e não pelo banco) porque o equipamento precisa
// ter um identificador definitivo já no cadastro offline: é esse id que vai
// virar o QR Code impresso e colado no equipamento, antes de qualquer sync.
export function novoId(): string {
  return Crypto.randomUUID();
}

export function agoraISO(): string {
  return new Date().toISOString();
}
