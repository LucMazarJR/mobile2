import { useColorScheme } from 'react-native';

// "Stamp" palette.
//
// Two rules drive everything. First: red, amber and green are DATA, not
// decoration. They encode how urgent a service is, so the brand has to stay out
// of that ramp entirely. The brand is therefore the ink itself (black on warm
// paper, like a stamped inspection tag). Second: one accent only, signal yellow,
// reserved for the single most important action (scan) and for focus.

const light = {
  brandDeep: '#161616',
  brand: '#161616',
  brandBright: '#2B2B2B',
  brandWash: '#E7E3D8',

  ink: '#161616',
  inkMuted: '#4F4B43',
  inkFaint: '#6E6859',
  line: '#D3CEBF',

  surface: '#FBFAF7',
  surfaceSunken: '#F2EFE8',
  surfaceAlt: '#E7E3D8',

  critical: '#B3261E',
  criticalWash: '#F6DEDA',
  warning: '#9A5200',
  warningWash: '#F8E8C8',
  ok: '#1F6B3F',
  okWash: '#DDEBD9',
  neutral: '#4F4B43',
  neutralWash: '#E7E3D8',

  onBrand: '#F2EFE8',

  signal: '#F2C200',
  onSignal: '#161616',
};

const dark: typeof light = {
  brandDeep: '#F2EFE8',
  brand: '#F2EFE8',
  brandBright: '#FFFFFF',
  brandWash: '#262521',

  ink: '#ECE8DD',
  inkMuted: '#B3AD9F',
  inkFaint: '#8A8475',
  line: '#38362F',

  surface: '#1C1B18',
  surfaceSunken: '#121211',
  surfaceAlt: '#262521',

  critical: '#F2857C',
  criticalWash: '#321A17',
  warning: '#E0A45C',
  warningWash: '#2E2312',
  ok: '#6FCB93',
  okWash: '#12291C',
  neutral: '#B3AD9F',
  neutralWash: '#262521',

  onBrand: '#161616',

  signal: '#F2C200',
  onSignal: '#161616',
};

export type Palette = typeof light;

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// Nearly square on purpose: stamped metal and printed tags, not soft cards.
// "pill" stays only for dots and indicators.
export const radius = { sm: 2, md: 3, lg: 4, pill: 999 } as const;

export const fonts = {
  display: 'BarlowCondensed_700Bold',
  displayMedium: 'BarlowCondensed_600SemiBold',
  text: 'IBMPlexSans_400Regular',
  textMedium: 'IBMPlexSans_500Medium',
  textStrong: 'IBMPlexSans_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoStrong: 'IBMPlexMono_500Medium',
} as const;

// One scale, exported as ready-made style objects so screens stop hand-rolling
// fontSize/fontWeight pairs. Condensed caps carry titles and figures; Plex Mono
// carries everything that reads like a label on the equipment (codes, dates,
// counters), which also keeps the digits from jittering.
export const type = {
  hero: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 44,
    textTransform: 'uppercase' as const,
  },
  display: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 34,
    textTransform: 'uppercase' as const,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 28,
    textTransform: 'uppercase' as const,
  },
  cardTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 21,
    lineHeight: 24,
    textTransform: 'uppercase' as const,
  },
  section: {
    fontFamily: fonts.monoStrong,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  body: { fontFamily: fonts.text, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.textStrong, fontSize: 15, lineHeight: 22 },
  support: { fontFamily: fonts.text, fontSize: 13, lineHeight: 18 },
  supportStrong: { fontFamily: fonts.textMedium, fontSize: 13, lineHeight: 18 },
  micro: {
    fontFamily: fonts.monoStrong,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  mono: { fontFamily: fonts.mono, fontSize: 13, lineHeight: 18, letterSpacing: 0.6 },
  monoStrong: { fontFamily: fonts.monoStrong, fontSize: 13, lineHeight: 18, letterSpacing: 0.6 },
  figure: { fontFamily: fonts.display, fontSize: 40, lineHeight: 40 },
  figureSmall: { fontFamily: fonts.display, fontSize: 28, lineHeight: 28 },
} as const;

export const tabular = { fontVariant: ['tabular-nums' as const] };
