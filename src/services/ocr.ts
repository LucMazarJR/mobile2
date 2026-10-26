// The text recogniser is a native module that only exists in an installed build
// (APK / development build). Importing it normally would crash the whole app in
// Expo Go the moment this file loads, so it is required lazily and a missing
// module simply means "OCR not available here".
type Extractor = {
  isSupported: boolean;
  extractTextFromImage: (uri: string) => Promise<string[]>;
};

let cached: Extractor | null | undefined;

function load(): Extractor | null {
  if (cached !== undefined) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require('@zhanziyang/expo-text-extractor') as Extractor;
    cached = module.isSupported ? module : null;
  } catch {
    cached = null;
  }

  return cached;
}

export function isOcrAvailable(): boolean {
  return load() !== null;
}

/** Lines of text found in the photo, in reading order. Empty when none. */
export async function readText(uri: string): Promise<string[]> {
  const engine = load();
  if (!engine) throw new Error('OCR is not available in this build');

  const lines = await engine.extractTextFromImage(uri);
  return lines.map((line) => line.trim()).filter(Boolean);
}
