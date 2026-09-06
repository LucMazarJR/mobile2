import type { SQLiteDatabase } from 'expo-sqlite';

import type { Manutencao, NovaManutencao } from '@/db/tipos';
import { agoraISO, novoId } from '@/services/ids';

export async function listarManutencoes(
  db: SQLiteDatabase,
  equipamentoId: string
): Promise<Manutencao[]> {
  return db.getAllAsync<Manutencao>(
    'SELECT * FROM manutencoes WHERE equipamento_id = ? ORDER BY data DESC, criado_em DESC',
    [equipamentoId]
  );
}

export async function criarManutencao(
  db: SQLiteDatabase,
  { equipamentoId, tipo, descricao, responsavel, data }: NovaManutencao
): Promise<string> {
  const id = novoId();
  const agora = agoraISO();

  await db.runAsync(
    `INSERT INTO manutencoes
       (id, equipamento_id, tipo, descricao, responsavel, data, criado_em, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [id, equipamentoId, tipo, descricao || null, responsavel || null, data, agora]
  );

  // O equipamento em si não mudou, mas a data de atualização registra que
  // houve movimentação no histórico dele.
  await db.runAsync('UPDATE equipamentos SET atualizado_em = ? WHERE id = ?', [
    agora,
    equipamentoId,
  ]);

  return id;
}
