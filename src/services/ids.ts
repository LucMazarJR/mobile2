import * as Crypto from 'expo-crypto';

// Ids are generated on the phone rather than by the database because a piece of
// equipment needs its final identifier the moment it is added, offline: that id
// is what gets printed on the QR label stuck to the equipment itself.
export function newId(): string {
  return Crypto.randomUUID();
}

export function nowISO(): string {
  return new Date().toISOString();
}

/** Short, human-checkable form of an id, matching what goes on the printed tag. */
export function tagCode(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}
