import type { SQLiteDatabase } from 'expo-sqlite';

import type { Sector, SectorWithCount } from '@/db/types';
import { nowISO, newId } from '@/services/ids';

export async function listSectors(db: SQLiteDatabase): Promise<SectorWithCount[]> {
  return db.getAllAsync<SectorWithCount>(`
    SELECT
      s.*,
      (SELECT COUNT(*) FROM equipment e
        WHERE e.sector_id = s.id AND e.deleted_at IS NULL) AS equipment_count
    FROM sectors s
    WHERE s.deleted_at IS NULL
    ORDER BY s.name COLLATE NOCASE
  `);
}

export async function findSector(db: SQLiteDatabase, id: string): Promise<Sector | null> {
  return db.getFirstAsync<Sector>('SELECT * FROM sectors WHERE id = ? AND deleted_at IS NULL', [
    id,
  ]);
}

export async function createSector(db: SQLiteDatabase, name: string): Promise<string> {
  const id = newId();
  const now = nowISO();

  await db.runAsync(
    'INSERT INTO sectors (id, name, created_at, updated_at, deleted_at, synced) VALUES (?, ?, ?, ?, NULL, 0)',
    [id, name, now, now]
  );

  return id;
}

export async function renameSector(
  db: SQLiteDatabase,
  id: string,
  name: string
): Promise<void> {
  await db.runAsync('UPDATE sectors SET name = ?, updated_at = ?, synced = 0 WHERE id = ?', [
    name,
    nowISO(),
    id,
  ]);
}

// Deleting a sector never deletes equipment. The equipment simply goes back to
// having no sector, which is why sector_id is cleared in the same transaction.
export async function deleteSector(db: SQLiteDatabase, id: string): Promise<void> {
  const now = nowISO();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE equipment SET sector_id = NULL, updated_at = ?, synced = 0 WHERE sector_id = ?',
      [now, id]
    );
    await db.runAsync(
      'UPDATE sectors SET deleted_at = ?, updated_at = ?, synced = 0 WHERE id = ?',
      [now, now, id]
    );
  });
}
