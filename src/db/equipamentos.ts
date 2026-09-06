import type { SQLiteDatabase } from 'expo-sqlite';

import type { EquipamentoComResumo, NovoEquipamento } from '@/db/tipos';
import { agoraISO, novoId } from '@/services/ids';

const SELECT_COM_RESUMO = `
  SELECT
    e.*,
    (SELECT MAX(m.data) FROM manutencoes m WHERE m.equipamento_id = e.id) AS ultima_manutencao,
    (SELECT COUNT(*) FROM manutencoes m WHERE m.equipamento_id = e.id) AS total_manutencoes
  FROM equipamentos e
`;

// Cada equipamento já vem com a data da última manutenção e o total delas,
// para a lista conseguir calcular o status (em dia / atrasado) sem uma
// segunda consulta por item.
export async function listarEquipamentos(db: SQLiteDatabase): Promise<EquipamentoComResumo[]> {
  return db.getAllAsync<EquipamentoComResumo>(`${SELECT_COM_RESUMO} ORDER BY e.nome COLLATE NOCASE`);
}

export async function buscarEquipamento(
  db: SQLiteDatabase,
  id: string
): Promise<EquipamentoComResumo | null> {
  return db.getFirstAsync<EquipamentoComResumo>(`${SELECT_COM_RESUMO} WHERE e.id = ?`, [id]);
}

export async function criarEquipamento(
  db: SQLiteDatabase,
  { nome, categoria, localizacao, intervaloDias }: NovoEquipamento
): Promise<string> {
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

export async function excluirEquipamento(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM equipamentos WHERE id = ?', [id]);
}
