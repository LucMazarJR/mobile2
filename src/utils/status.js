import { cores } from '@/theme';

const UM_DIA = 24 * 60 * 60 * 1000;

// Regra de status: conta os dias a partir da última manutenção (ou da data de
// cadastro, se o equipamento nunca recebeu manutenção) e compara com o
// intervalo configurado para aquele equipamento.
export function calcularStatus(equipamento) {
  const base = equipamento.ultima_manutencao || equipamento.criado_em;
  const intervalo = equipamento.intervalo_dias || 30;

  const proxima = new Date(base);
  proxima.setDate(proxima.getDate() + intervalo);

  const hoje = new Date();
  const diasRestantes = Math.ceil((proxima - hoje) / UM_DIA);

  if (diasRestantes < 0) {
    return {
      chave: 'atrasado',
      rotulo: `Atrasado ${Math.abs(diasRestantes)}d`,
      cor: cores.alerta,
      fundo: cores.alertaFraco,
      proxima,
    };
  }

  if (diasRestantes <= 7) {
    return {
      chave: 'proximo',
      rotulo: diasRestantes === 0 ? 'Vence hoje' : `Vence em ${diasRestantes}d`,
      cor: cores.aviso,
      fundo: cores.avisoFraco,
      proxima,
    };
  }

  return {
    chave: 'em-dia',
    rotulo: `Em dia · ${diasRestantes}d`,
    cor: cores.sucesso,
    fundo: cores.sucessoFraco,
    proxima,
  };
}

export function formatarData(iso) {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '—';
  return data.toLocaleDateString('pt-BR');
}

// Converte "06/09/2026" em ISO. Devolve null se a data for inválida,
// para o formulário conseguir avisar o usuário.
export function dataBrParaISO(texto) {
  const partes = (texto || '').trim().split('/');
  if (partes.length !== 3) return null;

  const [dia, mes, ano] = partes.map((parte) => Number(parte));
  if (!dia || !mes || !ano || ano < 1900) return null;

  const data = new Date(ano, mes - 1, dia, 12, 0, 0);
  if (data.getDate() !== dia || data.getMonth() !== mes - 1) return null;

  return data.toISOString();
}

export function hojeBr() {
  return new Date().toLocaleDateString('pt-BR');
}
