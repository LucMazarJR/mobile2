import type { SQLiteDatabase } from 'expo-sqlite';

// Estrutura do banco local (SQLite). É criada uma única vez, na abertura do app,
// através do onInit do <SQLiteProvider>.
//
// A coluna "synced" existe só aqui no aparelho: ela marca as linhas que ainda
// não foram enviadas ao Supabase. No Postgres essa coluna não existe, porque
// tudo que está lá, por definição, já foi sincronizado.
export async function migrarBanco(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS equipamentos (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      categoria TEXT,
      localizacao TEXT,
      intervalo_dias INTEGER NOT NULL DEFAULT 30,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS manutencoes (
      id TEXT PRIMARY KEY NOT NULL,
      equipamento_id TEXT NOT NULL REFERENCES equipamentos(id) ON DELETE CASCADE,
      tipo TEXT NOT NULL CHECK (tipo IN ('preventiva', 'corretiva')),
      descricao TEXT,
      responsavel TEXT,
      data TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_manutencoes_equipamento
      ON manutencoes(equipamento_id);
  `);
}

// Tabelas enviadas ao Supabase, na ordem em que precisam ser enviadas:
// equipamentos primeiro, senão a chave estrangeira de manutencoes falha no Postgres.
export const TABELAS_SINCRONIZAVEIS = ['equipamentos', 'manutencoes'] as const;

export type TabelaSincronizavel = (typeof TABELAS_SINCRONIZAVEIS)[number];
