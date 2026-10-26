import type { SQLiteDatabase } from 'expo-sqlite';

import type { Scan } from '@/db/types';
import { nowISO, newId } from '@/services/ids';

// A scan is the proof that someone stood in front of the equipment: the QR
// label only exists on the equipment itself. It enters the same upload queue as
// everything else.
export async function recordScan(db: SQLiteDatabase, equipmentId: string): Promise<Scan> {
  const id = newId();
  const now = nowISO();

  await db.runAsync(
    `INSERT INTO scans (id, equipment_id, scanned_at, created_at, deleted_at, synced)
     VALUES (?, ?, ?, ?, NULL, 0)`,
    [id, equipmentId, now, now]
  );

  return { id, equipment_id: equipmentId, scanned_at: now, created_at: now, deleted_at: null, synced: 0 };
}

export async function findScan(db: SQLiteDatabase, id: string): Promise<Scan | null> {
  return db.getFirstAsync<Scan>('SELECT * FROM scans WHERE id = ? AND deleted_at IS NULL', [id]);
}

export async function listScans(
  db: SQLiteDatabase,
  equipmentId: string,
  limit = 10
): Promise<Scan[]> {
  return db.getAllAsync<Scan>(
    `SELECT * FROM scans
      WHERE equipment_id = ? AND deleted_at IS NULL
      ORDER BY scanned_at DESC
      LIMIT ?`,
    [equipmentId, limit]
  );
}

export async function countScans(db: SQLiteDatabase, equipmentId: string): Promise<number> {
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM scans WHERE equipment_id = ? AND deleted_at IS NULL',
    [equipmentId]
  );
  return row?.total ?? 0;
}

export async function lastScanOverall(db: SQLiteDatabase): Promise<Scan | null> {
  return db.getFirstAsync<Scan>(
    'SELECT * FROM scans WHERE deleted_at IS NULL ORDER BY scanned_at DESC LIMIT 1'
  );
}
