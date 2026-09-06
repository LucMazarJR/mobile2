import { useColorScheme } from 'react-native';

// "Oficina" palette.
//
// The rule that drives everything: in this app red, amber and green are DATA,
// not decoration. They encode how urgent a service is, so the brand colour has
// to stay out of that ramp entirely. Deep petroleum teal reads as instrument
// panel and tooling rather than generic SaaS blue, and it leaves the whole warm
// half of the spectrum free for urgency.

const light = {
  brandDeep: '#06343A',
  brand: '#0E5B63',
  brandBright: '#16808C',
  brandWash: '#E2F1F2',

  ink: '#14181A',
  inkMuted: '#4A5459',
  inkFaint: '#7C878C',
  line: '#DDE3E5',

  surface: '#FFFFFF',
  surfaceSunken: '#F3F5F5',
  surfaceAlt: '#E9EDEE',

  critical: '#B3261E',
  criticalWash: '#FCE9E7',
  warning: '#A85B00',
  warningWash: '#FDF0DE',
  ok: '#16653C',
  okWash: '#E4F3EA',
  neutral: '#4A5459',
  neutralWash: '#EDF0F1',

  onBrand: '#FFFFFF',
};

const dark: typeof light = {
  brandDeep: '#9FD8DD',
  brand: '#3FA3AE',
  brandBright: '#5FBFC9',
  brandWash: '#0B2B2F',

  ink: '#E8EDEE',
  inkMuted: '#A3AFB3',
  inkFaint: '#78868B',
  line: '#2A3336',

  surface: '#161C1E',
  surfaceSunken: '#0F1416',
  surfaceAlt: '#1F272A',

  critical: '#F2857C',
  criticalWash: '#331A18',
  warning: '#E0A45C',
  warningWash: '#2E2312',
  ok: '#6FCB93',
  okWash: '#12291C',
  neutral: '#A3AFB3',
  neutralWash: '#232B2E',

  onBrand: '#04262A',
};

export type Palette = typeof light;

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

// One scale, exported as ready-made style objects so screens stop hand-rolling
// fontSize/fontWeight pairs. The tabular variants matter: this interface is
// full of day counts that would otherwise jitter as the digits change.
export const type = {
  display: { fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 34 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 28 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 22 },
  section: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  body: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: 'Inter_600SemiBold', fontSize: 15, lineHeight: 22 },
  support: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },
  supportStrong: { fontFamily: 'Inter_600SemiBold', fontSize: 13, lineHeight: 18 },
  micro: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
  mono: { fontFamily: 'monospace', fontSize: 13, lineHeight: 18, letterSpacing: 1 },
} as const;

export const tabular = { fontVariant: ['tabular-nums' as const] };
