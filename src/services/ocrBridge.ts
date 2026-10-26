import type { NameplateFields } from '@/db/types';

// Expo Router screens cannot return a value to the screen that opened them, so
// the OCR screen leaves its result here and the form picks it up when it comes
// back into focus. One slot is enough: there is only ever one form open.
export type OcrResult = { fields: NameplateFields; rawText: string };

let pending: OcrResult | null = null;

export function leaveOcrResult(result: OcrResult): void {
  pending = result;
}

export function takeOcrResult(): OcrResult | null {
  const result = pending;
  pending = null;
  return result;
}
