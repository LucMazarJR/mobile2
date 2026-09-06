import { agoraISO, novoId } from '@/services/ids';

// Lista os equipamentos já com dois dados agregados das manutenções:
// a data da última e o total. Assim a tela de lista consegue calcular o
// status (em dia / atrasado) sem precisar de uma segunda consulta por item.
export async function listarEquipamentos(db) {
  return db.getAllAsync(`
    SELECT
      e.*,
      (SELECT MAX(m.data) FROM manutencoes m WHERE m.equipamento_id = e.id) AS ultima_manutencao,
      (SELECT COUNT(*) FROM manutencoes m WHERE m.equipamento_id = e.id) AS total_manutencoes
    FROM equipamentos e
    ORDER BY e.nome COLLATE NOCASE
  `);
}

export async function buscarEquipamento(db, id) {
  return db.getFirstAsync(
    `
      SELECT
        e.*,
        (SELECT MAX(m.data) FROM manutencoes m WHERE m.equipamento_id = e.id) AS ultima_manutencao,
        (SELECT COUNT(*) FROM manutencoes m WHERE m.equipamento_id = e.id) AS total_manutencoes
      FROM equipamentos e
      WHERE e.id = ?
    `,
    [id]
  );
}

export async function criarEquipamento(db, { nome, categoria, localizacao, intervaloDias }) {
  const id = novoId();
  const agora = agoraISO();

  await db.runAsync(
    `INSERT INTO equipamentos
       (id, nome, categoria, localizacao, intervalo_dias, criado_em, atualizado_em, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [id, nome, categoria || null, localizacao || null, intervaloDias, agora, agora]
  );

  return id;
}

export async function excluirEquipamento(db, id) {
  await db.runAsync('DELETE FROM equipamentos WHERE id = ?', [id]);
}
