import type { SQLiteDatabase } from 'expo-sqlite';

import type { NameplateFields, NameplateReading } from '@/db/types';
import { nowISO, newId } from '@/services/ids';

export async function saveReading(
  db: SQLiteDatabase,
  equipmentId: string,
  rawText: string,
  { manufacturer, model, serialNumber }: NameplateFields
): Promise<string> {
  const id = newId();

  await db.runAsync(
    `INSERT INTO nameplate_readings
       (id, equipment_id, raw_text, manufacturer, model, serial_number, created_at, deleted_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0)`,
    [id, equipmentId, rawText, manufacturer || null, model || null, serialNumber || null, nowISO()]
  );

  return id;
}

export async function latestReading(
  db: SQLiteDatabase,
  equipmentId: string
): Promise<NameplateReading | null> {
  return db.getFirstAsync<NameplateReading>(
    `SELECT * FROM nameplate_readings
      WHERE equipment_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC LIMIT 1`,
    [equipmentId]
  );
}

export async function latestReadingOverall(
  db: SQLiteDatabase
): Promise<NameplateReading | null> {
  return db.getFirstAsync<NameplateReading>(
    'SELECT * FROM nameplate_readings WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1'
  );
}
