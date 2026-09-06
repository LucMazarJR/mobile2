import type { SQLiteDatabase } from 'expo-sqlite';

import type { Maintenance, MaintenanceInput } from '@/db/types';
import { nowISO, newId } from '@/services/ids';

export async function listMaintenance(
  db: SQLiteDatabase,
  equipmentId: string
): Promise<Maintenance[]> {
  return db.getAllAsync<Maintenance>(
    `SELECT * FROM maintenance
      WHERE equipment_id = ? AND deleted_at IS NULL
      ORDER BY performed_at DESC, created_at DESC`,
    [equipmentId]
  );
}

export async function findMaintenance(
  db: SQLiteDatabase,
  id: string
): Promise<Maintenance | null> {
  return db.getFirstAsync<Maintenance>(
    'SELECT * FROM maintenance WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
}

export async function createMaintenance(
  db: SQLiteDatabase,
  equipmentId: string,
  { type, description, technician, performedAt }: MaintenanceInput
): Promise<string> {
  const id = newId();
  const now = nowISO();

  await db.runAsync(
    `INSERT INTO maintenance
       (id, equipment_id, type, description, technician, performed_at, created_at, deleted_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0)`,
    [id, equipmentId, type, description || null, technician || null, performedAt, now]
  );

  await touchEquipment(db, equipmentId, now);

  return id;
}

export async function updateMaintenance(
  db: SQLiteDatabase,
  id: string,
  { type, description, technician, performedAt }: MaintenanceInput
): Promise<void> {
  await db.runAsync(
    `UPDATE maintenance
        SET type = ?, description = ?, technician = ?, performed_at = ?, synced = 0
      WHERE id = ?`,
    [type, description || null, technician || null, performedAt, id]
  );
}

export async function deleteMaintenance(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('UPDATE maintenance SET deleted_at = ?, synced = 0 WHERE id = ?', [
    nowISO(),
    id,
  ]);
}

// The equipment itself did not change, but the timestamp records that its
// history moved.
async function touchEquipment(
  db: SQLiteDatabase,
  equipmentId: string,
  now: string
): Promise<void> {
  await db.runAsync('UPDATE equipment SET updated_at = ? WHERE id = ?', [now, equipmentId]);
}
