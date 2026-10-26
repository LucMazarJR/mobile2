import type { NameplateFields } from '@/db/types';

// Turns the lines OCR found on an equipment plate into manufacturer, model and
// serial number. Plates are not standardised, so this is a set of heuristics, and
// that is why the app always shows the result for confirmation and keeps the raw
// text next to it.

type Kind = 'serial' | 'model' | 'manufacturer';

// Matched against text that is already upper-cased and stripped of accents.
const LABELS: { kind: Kind; pattern: string }[] = [
  {
    kind: 'serial',
    pattern: String.raw`S\/?N|SERIAL(?:\s*(?:NUMBER|NO|NUM))?|(?:N|NUM|NUMERO)[O.°º]?\s*(?:DE\s*)?SERIE|SER\.?\s*N[O.°º]?`,
  },
  { kind: 'model', pattern: String.raw`MODELO|MODEL|MOD|TYPE` },
  {
    kind: 'manufacturer',
    pattern: String.raw`FABRICANTE|FABR|MANUFACTURER|MANUFACTURED\s*BY|MFR|MARCA|BRAND|MADE\s*BY`,
  },
];

const LABEL_SOURCE = `(^|[^A-Z0-9])(${LABELS.map((label) => `(?<${label.kind}>${label.pattern})`).join('|')})\\s*[:.#\\-]?\\s*`;
const LABEL_REGEX = new RegExp(LABEL_SOURCE, 'g');
const HAS_LABEL = new RegExp(LABEL_SOURCE);

// Brands common on the kind of equipment this app tracks, used when the plate
// has no "Manufacturer:" label and only prints the logo as text.
const KNOWN_BRANDS = [
  'SPRINGER', 'CARRIER', 'MIDEA', 'ELGIN', 'CONSUL', 'BRASTEMP', 'ELECTROLUX', 'DAIKIN',
  'GREE', 'FUJITSU', 'PHILCO', 'KOMECO', 'SAMSUNG', 'LG', 'KIDDE', 'HONEYWELL', 'SIEMENS',
  'SCHNEIDER', 'WEG', 'CUMMINS', 'PERKINS', 'STEMAC', 'TOYAMA', 'BRANCO', 'BUFFALO', 'BOSCH',
  'MAKITA', 'INTELBRAS', 'RESIL', 'EXTINPEL', 'ANSUL', 'TYCO', 'CHUBB', 'YORK', 'TRANE',
  'HITACHI', 'PANASONIC', 'MITSUBISHI', 'GENERAL ELECTRIC', 'ABB', 'DELL', 'HP',
];

export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ªº°]/g, 'O')
    .toUpperCase();
}

function clean(value: string, singleToken: boolean): string {
  let result = value.replace(/^[\s:.#\-_/]+|[\s:.,;#\-_/]+$/g, '').replace(/\s+/g, ' ');
  if (singleToken) result = result.split(' ')[0] ?? '';
  return result.slice(0, 48);
}

export function parseNameplate(lines: string[]): NameplateFields {
  const found: Partial<Record<Kind, string>> = {};

  for (let index = 0; index < lines.length; index += 1) {
    const original = lines[index];
    const text = fold(original);
    // Slicing the original keeps its capitalisation; if folding changed the
    // length (decomposed accents), fall back to the folded text.
    const source = original.length === text.length ? original : text;

    const matches = [...text.matchAll(LABEL_REGEX)];

    matches.forEach((match, position) => {
      const kind = (Object.keys(match.groups ?? {}) as Kind[]).find((key) => match.groups?.[key]);
      if (!kind || found[kind]) return;

      const start = (match.index ?? 0) + match[0].length;
      const end = matches[position + 1]?.index ?? text.length;
      let value = clean(source.slice(start, end), kind === 'serial');

      // Label on one line, value on the next ("MODELO" / "ABC 6KG").
      if (!value && position === matches.length - 1 && lines[index + 1]) {
        const next = lines[index + 1];
        if (!HAS_LABEL.test(fold(next))) value = clean(next, kind === 'serial');
      }

      if (value) found[kind] = value;
    });
  }

  if (!found.manufacturer) {
    for (const line of lines) {
      const folded = fold(line);
      const brand = KNOWN_BRANDS.find((name) => new RegExp(`(^|[^A-Z0-9])${name}([^A-Z0-9]|$)`).test(folded));
      if (brand) {
        found.manufacturer = brand.charAt(0) + brand.slice(1).toLowerCase();
        break;
      }
    }
  }

  // Unlabelled serial: a long token mixing letters and digits that is not the model.
  if (!found.serial) {
    for (const line of lines) {
      const token = clean(line, true);
      const digits = (token.match(/\d/g) ?? []).length;
      if (/^[A-Za-z0-9-]{7,20}$/.test(token) && digits >= 4 && token !== found.model) {
        found.serial = token;
        break;
      }
    }
  }

  return {
    manufacturer: found.manufacturer ?? '',
    model: found.model ?? '',
    serialNumber: found.serial ?? '',
  };
}
