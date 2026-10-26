import Svg, { Circle, G, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  /** Plate colour. The marks inside always take the ink colour. */
  plate?: string;
  ink?: string;
};

// The app's mark: an identification plate with two rivets, the finder pattern
// of a QR code and engraved lines. It is the same drawing as the launcher icon
// (assets/brand/mark.svg), kept as vector so it stays sharp at any size.
export default function BrandMark({ size = 28, plate = '#F2C200', ink = '#161616' }: Props) {
  return (
    <Svg width={size} height={size * (440 / 720)} viewBox="152 292 720 440">
      <Rect x={152} y={292} width={720} height={440} rx={30} fill={plate} />
      <Circle cx={224} cy={512} r={24} fill={ink} />
      <Circle cx={800} cy={512} r={24} fill={ink} />
      <G fill={ink}>
        <Rect x={312} y={372} width={156} height={156} fill="none" stroke={ink} strokeWidth={26} />
        <Rect x={352} y={412} width={76} height={76} />
        <Rect x={520} y={372} width={204} height={26} />
        <Rect x={520} y={430} width={150} height={26} />
        <Rect x={520} y={488} width={204} height={26} />
        <Rect x={312} y={580} width={412} height={26} />
        <Rect x={312} y={638} width={250} height={26} />
      </G>
    </Svg>
  );
}
