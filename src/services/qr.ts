import QRCode from 'qrcode/lib/core/qrcode';

import { tagCode } from '@/services/ids';

// What a printed label says. It is a link, not a bare id, on purpose: read by
// the app it opens the equipment and records the visit, and read by the phone's
// own camera it opens the app through the same address. One format, two readers.
const SCHEME = 'stamp';

export function visitLink(equipmentId: string): string {
  return `${SCHEME}://visit/${equipmentId}`;
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const SHORT_CODE = /^[0-9a-f]{8}$/i;

export type ParsedTag = { kind: 'id'; id: string } | { kind: 'code'; code: string };

// Accepts the full link, a bare id, or the 8 character code printed under the
// QR, because a damaged label can still be typed in by hand.
export function parseTag(raw: string): ParsedTag | null {
  const text = raw.trim();

  const id = text.match(UUID)?.[0];
  if (id) return { kind: 'id', id: id.toLowerCase() };

  if (SHORT_CODE.test(text)) return { kind: 'code', code: text.toUpperCase() };

  return null;
}

export { tagCode };

export type QrPath = { size: number; path: string };

// The QR as one SVG path: a horizontal run of dark modules is a single "h"
// segment, which keeps the output small enough to embed once per label in a PDF.
export function qrPath(text: string): QrPath {
  const { size, data } = QRCode.create(text, { errorCorrectionLevel: 'M' }).modules;

  let path = '';
  for (let y = 0; y < size; y += 1) {
    let x = 0;
    while (x < size) {
      if (!data[y * size + x]) {
        x += 1;
        continue;
      }
      const start = x;
      while (x < size && data[y * size + x]) x += 1;
      path += `M${start} ${y}h${x - start}v1h-${x - start}z`;
    }
  }

  return { size, path };
}

/** Standalone SVG markup, used when composing the printable labels. */
export function qrSvgMarkup(text: string, color = '#000'): string {
  const { size, path } = qrPath(text);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${size + 4} ${size + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${size + 4}" height="${size + 4}" fill="#fff"/><path d="${path}" fill="${color}"/></svg>`;
}
