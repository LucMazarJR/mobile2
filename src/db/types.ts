// Types mirroring the local tables. The same columns exist in Postgres, except
// for "synced", which is device-only bookkeeping.

export type Sector = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced: number;
};

export type SectorWithCount = Sector & {
  equipment_count: number;
};

export type Equipment = {
  id: string;
  name: string;
  category: string | null;
  location: string | null;
  sector_id: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  interval_days: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced: number;
};

// Equipment plus the aggregates from its maintenance history, used in lists.
export type EquipmentWithSummary = Equipment & {
  last_maintenance: string | null;
  maintenance_count: number;
  sector_name: string | null;
  last_scan: string | null;
};

export type MaintenanceType = 'preventive' | 'corrective';

export type Maintenance = {
  id: string;
  equipment_id: string;
  type: MaintenanceType;
  description: string | null;
  technician: string | null;
  performed_at: string;
  /** Visit (QR scan) during which this service was logged; null when typed in by hand. */
  scan_id: string | null;
  created_at: string;
  deleted_at: string | null;
  synced: number;
};

// One QR label read on site.
export type Scan = {
  id: string;
  equipment_id: string;
  scanned_at: string;
  created_at: string;
  deleted_at: string | null;
  synced: number;
};

// What OCR pulled off a nameplate, with the raw text kept as evidence.
export type NameplateReading = {
  id: string;
  equipment_id: string;
  raw_text: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  created_at: string;
  deleted_at: string | null;
  synced: number;
};

export type NameplateFields = {
  manufacturer: string;
  model: string;
  serialNumber: string;
};

export type EquipmentInput = {
  name: string;
  category: string;
  location: string;
  intervalDays: number;
  sectorId: string | null;
  manufacturer: string;
  model: string;
  serialNumber: string;
};

export type MaintenanceInput = {
  type: MaintenanceType;
  description: string;
  technician: string;
  performedAt: string;
  scanId?: string | null;
};
