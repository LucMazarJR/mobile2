import type { SQLiteDatabase } from 'expo-sqlite';

import { SYNCED_TABLES, type SyncedTable } from '@/db/schema';
import { supabase } from '@/services/supabase';

export type UploadResult =
  | { ok: true; uploaded: number }
  | { ok: false; reason: 'not-configured'; uploaded: number }
  | { ok: false; reason: 'offline'; uploaded: number }
  | { ok: false; reason: 'failed'; detail: string; uploaded: number };

export type PendingCounts = Record<SyncedTable, number>;

// Being offline is this app's normal state, not an error: the technician is
// usually in a plant room or a basement. So a network failure is kept separate
// from a real one — only the second deserves an alarm on screen.
function isNetworkFailure(error: unknown): boolean {
  const text = error instanceof Error ? error.message : String(error);
  return /network request failed|failed to fetch|aborterror|timeout|networkerror/i.test(text);
}

export async function countPending(db: SQLiteDatabase): Promise<PendingCounts> {
  const counts = {} as PendingCounts;

  for (const table of SYNCED_TABLES) {
    const row = await db.getFirstAsync<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ${table} WHERE synced = 0`
    );
    counts[table] = row?.total ?? 0;
  }

  return counts;
}

export function totalPending(counts: PendingCounts): number {
  return SYNCED_TABLES.reduce((total, table) => total + counts[table], 0);
}

async function uploadTable(db: SQLiteDatabase, table: SyncedTable): Promise<number> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM ${table} WHERE synced = 0`
  );
  if (rows.length === 0) return 0;

  // "synced" is local bookkeeping and does not exist in Postgres. "deleted_at"
  // exists on both sides and rides along — that is how a deletion reaches the
  // cloud instead of the row simply vanishing from this phone.
  const payload = rows.map(({ synced, ...rest }) => rest);

  const { error } = await supabase!.from(table).upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(`${table}: ${error.message}`);

  const ids = rows.map((row) => row.id as string);
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(`UPDATE ${table} SET synced = 1 WHERE id IN (${placeholders})`, ids);

  return rows.length;
}

// Uploads everything pending. On failure the rows keep synced = 0 and the next
// attempt sends them again, so there is no need to check connectivity first.
export async function uploadPending(db: SQLiteDatabase): Promise<UploadResult> {
  if (!supabase) return { ok: false, reason: 'not-configured', uploaded: 0 };

  let uploaded = 0;

  try {
    for (const table of SYNCED_TABLES) {
      uploaded += await uploadTable(db, table);
    }
    return { ok: true, uploaded };
  } catch (error) {
    if (isNetworkFailure(error)) return { ok: false, reason: 'offline', uploaded };
    return {
      ok: false,
      reason: 'failed',
      detail: error instanceof Error ? error.message : String(error),
      uploaded,
    };
  }
}

// Postgres returns dates as "2026-09-06T15:00:00+00:00" while the app writes
// "2026-09-06T15:00:00.000Z". Storing both formats would break the plain string
// comparisons used by MAX(performed_at) and ORDER BY.
function normalizeDate(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const DATE_COLUMNS = ['created_at', 'updated_at', 'performed_at', 'deleted_at'];

// Brings down what this phone has never seen. One rule makes it safe: INSERT OR
// IGNORE, local always wins. That kills every conflict class at once — a row
// edited here survives, a row deleted here cannot come back, and a row deleted
// on another phone arrives with deleted_at already set, so it stays hidden.
export async function downloadFromCloud(db: SQLiteDatabase): Promise<number> {
  if (!supabase) return 0;

  let downloaded = 0;

  for (const table of SYNCED_TABLES) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data || data.length === 0) continue;

    await db.withTransactionAsync(async () => {
      for (const row of data as Record<string, unknown>[]) {
        const values: Record<string, unknown> = { ...row, synced: 1 };
        for (const column of DATE_COLUMNS) {
          if (column in values) values[column] = normalizeDate(values[column]);
        }

        const columns = Object.keys(values);
        const placeholders = columns.map(() => '?').join(',');
        const result = await db.runAsync(
          `INSERT OR IGNORE INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`,
          columns.map((column) => values[column] as string | number | null)
        );

        downloaded += result.changes;
      }
    });
  }

  return downloaded;
}
