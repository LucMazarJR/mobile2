// Tipos que espelham as tabelas do SQLite. As mesmas colunas existem no
// Postgres do Supabase, com exceção de "synced", que é controle local.

export type Equipamento = {
  id: string;
  nome: string;
  categoria: string | null;
  localizacao: string | null;
  intervalo_dias: number;
  criado_em: string;
  atualizado_em: string;
  synced: number;
};

// Equipamento acrescido dos dados agregados das manutenções, usado nas listagens.
export type EquipamentoComResumo = Equipamento & {
  ultima_manutencao: string | null;
  total_manutencoes: number;
};

export type TipoManutencao = 'preventiva' | 'corretiva';

export type Manutencao = {
  id: string;
  equipamento_id: string;
  tipo: TipoManutencao;
  descricao: string | null;
  responsavel: string | null;
  data: string;
  criado_em: string;
  synced: number;
};

export type NovoEquipamento = {
  nome: string;
  categoria: string;
  localizacao: string;
  intervaloDias: number;
};

export type NovaManutencao = {
  equipamentoId: string;
  tipo: TipoManutencao;
  descricao: string;
  responsavel: string;
  data: string;
};
