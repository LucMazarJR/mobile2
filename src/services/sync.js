import { TABELAS_SINCRONIZAVEIS } from '@/db/schema';
import { supabase, supabaseConfigurado } from '@/services/supabase';

// Não existe tabela de fila: "pendente" é simplesmente toda linha com synced = 0.
export async function contarPendentes(db) {
  let total = 0;

  for (const tabela of TABELAS_SINCRONIZAVEIS) {
    const linha = await db.getFirstAsync(
      `SELECT COUNT(*) AS total FROM ${tabela} WHERE synced = 0`
    );
    total += linha?.total ?? 0;
  }

  return total;
}

async function sincronizarTabela(db, tabela) {
  const linhas = await db.getAllAsync(`SELECT * FROM ${tabela} WHERE synced = 0`);
  if (linhas.length === 0) return { enviadas: 0 };

  // A coluna synced é controle local e não existe no Postgres.
  const payload = linhas.map(({ synced, ...resto }) => resto);

  const { error } = await supabase.from(tabela).upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(`${tabela}: ${error.message}`);

  const ids = linhas.map((linha) => linha.id);
  const marcadores = ids.map(() => '?').join(',');
  await db.runAsync(`UPDATE ${tabela} SET synced = 1 WHERE id IN (${marcadores})`, ids);

  return { enviadas: linhas.length };
}

// Envia tudo que está pendente. Se falhar (sem internet, Supabase fora do ar,
// política RLS bloqueando), as linhas continuam com synced = 0 e a próxima
// tentativa reenvia — por isso não é preciso checar a conexão antes.
export async function sincronizar(db) {
  if (!supabaseConfigurado) {
    return { ok: false, motivo: 'sem-credenciais', enviadas: 0 };
  }

  let enviadas = 0;

  try {
    for (const tabela of TABELAS_SINCRONIZAVEIS) {
      const resultado = await sincronizarTabela(db, tabela);
      enviadas += resultado.enviadas;
    }
    return { ok: true, enviadas };
  } catch (erro) {
    return { ok: false, motivo: 'falha', erro: erro.message, enviadas };
  }
}
