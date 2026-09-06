import { agoraISO, novoId } from '@/services/ids';

export async function listarManutencoes(db, equipamentoId) {
  return db.getAllAsync(
    'SELECT * FROM manutencoes WHERE equipamento_id = ? ORDER BY data DESC, criado_em DESC',
    [equipamentoId]
  );
}

export async function criarManutencao(db, { equipamentoId, tipo, descricao, responsavel, data }) {
  const id = novoId();
  const agora = agoraISO();

  await db.runAsync(
    `INSERT INTO manutencoes
       (id, equipamento_id, tipo, descricao, responsavel, data, criado_em, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [id, equipamentoId, tipo, descricao || null, responsavel || null, data, agora]
  );

  // O equipamento em si não mudou, mas a data de atualização serve para
  // indicar que houve movimentação no registro.
  await db.runAsync('UPDATE equipamentos SET atualizado_em = ? WHERE id = ?', [
    agora,
    equipamentoId,
  ]);

  return id;
}
