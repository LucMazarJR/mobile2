// "qrcode" ships no types for its core module. This is the only part used: it
// returns the module matrix, and the drawing is done by this app.
declare module 'qrcode/lib/core/qrcode' {
  type Level = 'L' | 'M' | 'Q' | 'H';

  const QRCode: {
    create(
      text: string,
      options?: { errorCorrectionLevel?: Level }
    ): { modules: { size: number; data: Uint8Array } };
  };

  export default QRCode;
}
