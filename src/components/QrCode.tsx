import { useMemo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { qrPath } from '@/services/qr';

type Props = {
  value: string;
  size?: number;
};

// Always black on white with a quiet zone, whatever the theme: a QR printed in
// dark mode colours would not scan from paper.
export default function QrCode({ value, size = 160 }: Props) {
  const { size: modules, path } = useMemo(() => qrPath(value), [value]);

  return (
    <Svg width={size} height={size} viewBox={`-2 -2 ${modules + 4} ${modules + 4}`}>
      <Rect x={-2} y={-2} width={modules + 4} height={modules + 4} fill="#FFFFFF" />
      <Path d={path} fill="#161616" />
    </Svg>
  );
}
