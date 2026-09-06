import type { SQLiteDatabase } from 'expo-sqlite';

import type { EquipmentInput, EquipmentWithSummary } from '@/db/types';
import { nowISO, newId } from '@/services/ids';

// Deleted rows stay in the table (with deleted_at filled in) until they reach
// the cloud, so every read has to filter them out.
const SELECT_WITH_SUMMARY = `
  SELECT
    e.*,
    (SELECT MAX(m.performed_at) FROM maintenance m
      WHERE m.equipment_id = e.id AND m.deleted_at IS NULL) AS last_maintenance,
    (SELECT COUNT(*) FROM maintenance m
      WHERE m.equipment_id = e.id AND m.deleted_at IS NULL) AS maintenance_count
  FROM equipment e
`;

export async function listEquipment(db: SQLiteDatabase): Promise<EquipmentWithSummary[]> {
  return db.getAllAsync<EquipmentWithSummary>(
    `${SELECT_WITH_SUMMARY} WHERE e.deleted_at IS NULL ORDER BY e.name COLLATE NOCASE`
  );
}

export async function findEquipment(
  db: SQLiteDatabase,
  id: string
): Promise<EquipmentWithSummary | null> {
  return db.getFirstAsync<EquipmentWithSummary>(
    `${SELECT_WITH_SUMMARY} WHERE e.id = ? AND e.deleted_at IS NULL`,
    [id]
  );
}

export async function createEquipment(
  db: SQLiteDatabase,
  { name, category, location, intervalDays }: EquipmentInput
): Promise<string> {
  const id = newId();
  const now = nowISO();

  await db.runAsync(
    `INSERT INTO equipment
       (id, name, category, location, interval_days, created_at, updated_at, deleted_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0)`,
    [id, name, category || null, location || null, intervalDays, now, now]
  );

  return id;
}

// synced = 0 is the whole trick: the edited row re-enters the existing upload
// queue, so editing needs no new cloud code at all.
export async function updateEquipment(
  db: SQLiteDatabase,
  id: string,
  { name, category, location, intervalDays }: EquipmentInput
): Promise<void> {
  await db.runAsync(
    `UPDATE equipment
        SET name = ?, category = ?, location = ?, interval_days = ?,
            updated_at = ?, synced = 0
      WHERE id = ?`,
    [name, category || null, location || null, intervalDays, nowISO(), id]
  );
}

// Logical deletion: the equipment and its history are marked as deleted and go
// back into the upload queue, so the cloud receives the same deletion.
export async function deleteEquipment(db: SQLiteDatabase, id: string): Promise<void> {
  const now = nowISO();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE maintenance SET deleted_at = ?, synced = 0 WHERE equipment_id = ? AND deleted_at IS NULL',
      [now, id]
    );
    await db.runAsync(
      'UPDATE equipment SET deleted_at = ?, updated_at = ?, synced = 0 WHERE id = ?',
      [now, now, id]
    );
  });
}
