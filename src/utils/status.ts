import type { EquipmentWithSummary } from '@/db/types';
import type { Dictionary } from '@/i18n/pt-BR';
import type { Palette } from '@/theme';

const ONE_DAY = 24 * 60 * 60 * 1000;

export type StatusKey = 'overdue' | 'due-soon' | 'on-track';

export type Status = {
  key: StatusKey;
  /** Days until the next service; negative when overdue. */
  daysLeft: number;
  /** Null when the stored dates cannot be parsed. */
  next: Date | null;
};

type StatusSource = Pick<
  EquipmentWithSummary,
  'last_maintenance' | 'created_at' | 'interval_days'
>;

// Status is derived, never stored: days counted from the last service — or from
// the day the equipment was added, when it has never been serviced — compared
// against its own interval.
export function computeStatus(equipment: StatusSource): Status {
  const base = equipment.last_maintenance || equipment.created_at;
  const interval = equipment.interval_days || 30;

  const next = new Date(base);

  // A date that cannot be parsed would make toISOString() throw and take the
  // whole screen down, so it degrades to "on track" with no due date instead.
  if (Number.isNaN(next.getTime())) {
    return { key: 'on-track', daysLeft: interval, next: null };
  }

  next.setDate(next.getDate() + interval);
  const daysLeft = Math.ceil((next.getTime() - Date.now()) / ONE_DAY);

  if (daysLeft < 0) return { key: 'overdue', daysLeft, next };
  if (daysLeft <= 7) return { key: 'due-soon', daysLeft, next };
  return { key: 'on-track', daysLeft, next };
}

export function statusColors(status: Status, palette: Palette) {
  switch (status.key) {
    case 'overdue':
      return { fg: palette.critical, bg: palette.criticalWash };
    case 'due-soon':
      return { fg: palette.warning, bg: palette.warningWash };
    default:
      return { fg: palette.ok, bg: palette.okWash };
  }
}

/** Compact label for the chip. */
export function statusChipLabel(status: Status, t: Dictionary): string {
  switch (status.key) {
    case 'overdue':
      return t.status.overdueChip(Math.abs(status.daysLeft));
    case 'due-soon':
      return status.daysLeft === 0 ? t.status.dueTodayChip : t.status.dueSoonChip(status.daysLeft);
    default:
      return t.status.onTrackChip;
  }
}

/** Spelled-out sentence, used in the card footer and for screen readers. */
export function statusFullLabel(status: Status, t: Dictionary): string {
  switch (status.key) {
    case 'overdue':
      return t.status.overdueFull(Math.abs(status.daysLeft));
    case 'due-soon':
      return status.daysLeft === 0 ? t.status.dueTodayFull : t.status.dueSoonFull(status.daysLeft);
    default:
      return t.status.onTrackFull(status.daysLeft);
  }
}

export function formatDate(value: Date | string | null | undefined, locale: string): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale);
}

export function formatTime(value: Date | null, locale: string): string {
  if (!value || Number.isNaN(value.getTime())) return '—';
  return value.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/** Turns "06/09/2026" into an ISO string, or null when the date makes no sense. */
export function parseLocalDate(text: string): string | null {
  const parts = (text || '').trim().split('/');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map((part) => Number(part));
  if (!day || !month || !year || year < 1900) return null;

  const date = new Date(year, month - 1, day, 12, 0, 0);
  if (date.getDate() !== day || date.getMonth() !== month - 1) return null;

  return date.toISOString();
}

export function toLocalDateInput(value: Date): string {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${value.getFullYear()}`;
}

/** Adds slashes as the user types, so nobody has to reach for the symbol row. */
export function maskDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function isFuture(iso: string): boolean {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return new Date(iso).getTime() > endOfToday.getTime();
}
