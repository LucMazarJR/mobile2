import type { SQLiteDatabase } from 'expo-sqlite';

// Local database structure, created and upgraded on app start through the
// onInit hook of <SQLiteProvider>.
//
// Two columns exist only on the device and not in Postgres:
//   synced:     marks rows that have not reached the cloud yet.
//   deleted_at: deletion is logical, never physical. Without it a deleted
//                 row would just vanish from here and live forever in the
//                 cloud, because the upload only knows how to send rows that
//                 still exist.
// (deleted_at also exists in Postgres; synced does not.)
//
// Migrations are a log, not a snapshot: step 1 still creates the original
// Portuguese tables because that is what shipped on real devices. Step 3
// renames them. Rewriting step 1 would break every phone that already ran it.

const TARGET_VERSION = 6;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version >= TARGET_VERSION) return;

  if (version < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS equipamentos (
        id TEXT PRIMARY KEY NOT NULL,
        nome TEXT NOT NULL,
        categoria TEXT,
        localizacao TEXT,
        intervalo_dias INTEGER NOT NULL DEFAULT 30,
        criado_em TEXT NOT NULL,
        atualizado_em TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS manutencoes (
        id TEXT PRIMARY KEY NOT NULL,
        equipamento_id TEXT NOT NULL REFERENCES equipamentos(id) ON DELETE CASCADE,
        tipo TEXT NOT NULL CHECK (tipo IN ('preventiva', 'corretiva')),
        descricao TEXT,
        responsavel TEXT,
        data TEXT NOT NULL,
        criado_em TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );
    `);
    version = 1;
    await setVersion(db, 1);
  }

  if (version < 2) {
    await addColumnIfMissing(db, 'equipamentos', 'deleted_at', 'TEXT');
    await addColumnIfMissing(db, 'manutencoes', 'deleted_at', 'TEXT');
    version = 2;
    await setVersion(db, 2);
  }

  if (version < 3) {
    // Rename everything to English, carrying existing rows over. Values of
    // "tipo" are translated too, since the app now stores canonical English
    // keys and translates them at render time.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS equipment (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        location TEXT,
        interval_days INTEGER NOT NULL DEFAULT 30,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        synced INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS maintenance (
        id TEXT PRIMARY KEY NOT NULL,
        equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('preventive', 'corrective')),
        description TEXT,
        technician TEXT,
        performed_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        deleted_at TEXT,
        synced INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );

      INSERT OR IGNORE INTO equipment
        (id, name, category, location, interval_days, created_at, updated_at, deleted_at, synced)
        SELECT id, nome, categoria, localizacao, intervalo_dias,
               criado_em, atualizado_em, deleted_at, synced
          FROM equipamentos;

      INSERT OR IGNORE INTO maintenance
        (id, equipment_id, type, description, technician, performed_at, created_at, deleted_at, synced)
        SELECT id, equipamento_id,
               CASE tipo WHEN 'preventiva' THEN 'preventive' ELSE 'corrective' END,
               descricao, responsavel, data, criado_em, deleted_at, synced
          FROM manutencoes;

      DROP TABLE IF EXISTS manutencoes;
      DROP TABLE IF EXISTS equipamentos;

      CREATE INDEX IF NOT EXISTS idx_maintenance_equipment
        ON maintenance(equipment_id);
    `);

    // Rows carried over were written against the old table names in the cloud,
    // so they have to be uploaded again under the new ones.
    await db.execAsync(`
      UPDATE equipment SET synced = 0;
      UPDATE maintenance SET synced = 0;
    `);

    version = 3;
    await setVersion(db, 3);
  }

  if (version < 4) {
    // Sectors group equipment by the part of the building it belongs to, so a
    // caretaker can ask "what is pending in the kitchen" instead of scanning
    // one long list.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sectors (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        synced INTEGER NOT NULL DEFAULT 0
      );
    `);

    await addColumnIfMissing(db, 'equipment', 'sector_id', 'TEXT');

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_equipment_sector ON equipment(sector_id);
    `);

    version = 4;
    await setVersion(db, 4);
  }

  if (version < 5) {
    // Step 4 could mark itself done without having created anything, back when
    // the version was written only at the very end of the run. This step redoes
    // that work; every statement is guarded, so on a healthy database it costs
    // nothing.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sectors (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        synced INTEGER NOT NULL DEFAULT 0
      );
    `);
    await addColumnIfMissing(db, 'equipment', 'sector_id', 'TEXT');
    await db.execAsync(
      'CREATE INDEX IF NOT EXISTS idx_equipment_sector ON equipment(sector_id);'
    );

    version = 5;
    await setVersion(db, 5);
  }

  if (version < 6) {
    // Computer vision results. A scan is one QR label read on site (proof that
    // somebody stood in front of the equipment); a nameplate reading is what OCR
    // extracted from the metal plate, kept together with the raw text so the
    // extraction can always be audited. Every statement is guarded, so a step
    // that stopped halfway can simply run again.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY NOT NULL,
        equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
        scanned_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        deleted_at TEXT,
        synced INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS nameplate_readings (
        id TEXT PRIMARY KEY NOT NULL,
        equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
        raw_text TEXT NOT NULL,
        manufacturer TEXT,
        model TEXT,
        serial_number TEXT,
        created_at TEXT NOT NULL,
        deleted_at TEXT,
        synced INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_scans_equipment ON scans(equipment_id);
      CREATE INDEX IF NOT EXISTS idx_readings_equipment ON nameplate_readings(equipment_id);
    `);

    await addColumnIfMissing(db, 'equipment', 'manufacturer', 'TEXT');
    await addColumnIfMissing(db, 'equipment', 'model', 'TEXT');
    await addColumnIfMissing(db, 'equipment', 'serial_number', 'TEXT');
    await addColumnIfMissing(db, 'maintenance', 'scan_id', 'TEXT');

    // Equipment and maintenance gained columns the cloud copy does not have yet
    // for rows already uploaded, so they go back in the queue once.
    await db.execAsync(`
      UPDATE equipment SET synced = 0;
      UPDATE maintenance SET synced = 0;
    `);

    version = 6;
    await setVersion(db, 6);
  }
}

// Written right after each step succeeds, never once at the end: a run that
// stops halfway has to leave behind a version that tells the truth, otherwise
// the next start skips work that never happened.
async function setVersion(db: SQLiteDatabase, version: number): Promise<void> {
  await db.execAsync(`PRAGMA user_version = ${version}`);
}

// SQLite has no ALTER TABLE ADD COLUMN IF NOT EXISTS: running it twice throws
// "duplicate column name". Since the provider uses Suspense, a throw here would
// leave the app on a blank screen, hence the check.
async function addColumnIfMissing(
  db: SQLiteDatabase,
  table: string,
  column: string,
  type: string
): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (columns.some((c) => c.name === column)) return;
  await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
}

export async function databaseVersion(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

// Tables exchanged with the cloud, in upload order. Parents go first, or the
// foreign keys fail in Postgres: a sector before the equipment that points at
// it, the equipment before its scans and readings, and the scans before the
// maintenance that points at the visit that originated it.
export const SYNCED_TABLES = [
  'sectors',
  'equipment',
  'scans',
  'nameplate_readings',
  'maintenance',
] as const;

export type SyncedTable = (typeof SYNCED_TABLES)[number];
