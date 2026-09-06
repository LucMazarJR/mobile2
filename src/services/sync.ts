import type { SQLiteDatabase } from 'expo-sqlite';

import { TABELAS_SINCRONIZAVEIS, type TabelaSincronizavel } from '@/db/schema';
import { supabase } from '@/services/supabase';

export type ResultadoSync =
  | { ok: true; enviadas: number }
  | { ok: false; motivo: 'sem-credenciais'; enviadas: number }
  | { ok: false; motivo: 'falha'; erro: string; enviadas: number };

// Não existe tabela de fila: "pendente" é simplesmente toda linha com synced = 0.
export async function contarPendentes(db: SQLiteDatabase): Promise<number> {
  let total = 0;

  for (const tabela of TABELAS_SINCRONIZAVEIS) {
    const linha = await db.getFirstAsync<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ${tabela} WHERE synced = 0`
    );
    total += linha?.total ?? 0;
  }

  return total;
}

async function sincronizarTabela(
  db: SQLiteDatabase,
  tabela: TabelaSincronizavel
): Promise<number> {
  const linhas = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM ${tabela} WHERE synced = 0`
  );
  if (linhas.length === 0) return 0;

  // A coluna synced é controle local e não existe no Postgres.
  const payload = linhas.map(({ synced, ...resto }) => resto);

  const { error } = await supabase!.from(tabela).upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(`${tabela}: ${error.message}`);

  const ids = linhas.map((linha) => linha.id as string);
  const marcadores = ids.map(() => '?').join(',');
  await db.runAsync(`UPDATE ${tabela} SET synced = 1 WHERE id IN (${marcadores})`, ids);

  return linhas.length;
}

// Envia tudo que está pendente. Se falhar (sem internet, Supabase fora do ar,
// política RLS bloqueando), as linhas continuam com synced = 0 e a próxima
// tentativa reenvia — por isso não é preciso checar a conexão antes.
export async function sincronizar(db: SQLiteDatabase): Promise<ResultadoSync> {
  if (!supabase) {
    return { ok: false, motivo: 'sem-credenciais', enviadas: 0 };
  }

  let enviadas = 0;

  try {
    for (const tabela of TABELAS_SINCRONIZAVEIS) {
      enviadas += await sincronizarTabela(db, tabela);
    }
    return { ok: true, enviadas };
  } catch (erro) {
    return {
      ok: false,
      motivo: 'falha',
      erro: erro instanceof Error ? erro.message : String(erro),
      enviadas,
    };
  }
}
