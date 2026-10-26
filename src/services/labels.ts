import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { EquipmentWithSummary } from '@/db/types';
import { tagCode } from '@/services/ids';
import { qrSvgMarkup, visitLink } from '@/services/qr';

type LabelText = { pageTitle: string; scanToOpen: string; noSector: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// A label is 70 x 38 mm: QR on the left (the part that has to survive on the
// equipment), the human-readable code and name on the right so a damaged QR can
// still be typed in.
function labelHtml(item: EquipmentWithSummary, text: LabelText): string {
  const place = item.sector_name ?? text.noSector;

  return `
    <div class="label">
      <div class="qr">${qrSvgMarkup(visitLink(item.id))}</div>
      <div class="info">
        <div class="brand">STAMP</div>
        <div class="name">${escapeHtml(item.name)}</div>
        <div class="place">${escapeHtml(place)}</div>
        <div class="code">${tagCode(item.id)}</div>
        <div class="hint">${escapeHtml(text.scanToOpen)}</div>
      </div>
    </div>`;
}

function pageHtml(items: EquipmentWithSummary[], text: LabelText): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(text.pageTitle)}</title>
<style>
  @page { margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Helvetica, Arial, sans-serif; color: #161616; }
  .grid { display: flex; flex-wrap: wrap; gap: 4mm; }
  .label {
    width: 88mm; height: 40mm; display: flex; gap: 4mm; align-items: center;
    border: 0.4mm solid #161616; border-radius: 1mm; padding: 3mm; break-inside: avoid;
  }
  .qr { width: 30mm; height: 30mm; flex: none; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .info { flex: 1; min-width: 0; }
  .brand { font-size: 7pt; letter-spacing: 0.25em; font-weight: 700; background: #F2C200; display: inline-block; padding: 0.6mm 1.6mm; }
  .name { font-size: 12pt; font-weight: 700; margin-top: 2mm; line-height: 1.15; }
  .place { font-size: 8.5pt; color: #4F4B43; margin-top: 1mm; }
  .code { font-family: 'Courier New', monospace; font-size: 13pt; font-weight: 700; letter-spacing: 0.12em; margin-top: 2mm; }
  .hint { font-size: 6.5pt; color: #6E6859; margin-top: 1mm; }
</style>
</head>
<body><div class="grid">${items.map((item) => labelHtml(item, text)).join('')}</div></body>
</html>`;
}

// Builds the PDF and hands it to the system share sheet, which is also the way
// to print it: from there the person picks a printer or saves the file.
export async function shareLabels(
  items: EquipmentWithSummary[],
  text: LabelText
): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html: pageHtml(items, text) });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  } else {
    await Print.printAsync({ uri });
  }
}
