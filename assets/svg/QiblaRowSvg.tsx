import { Svg, Path } from 'react-native-svg';

const QiblaRowSvg = ({ fill }: { fill: string }) => {
  return (
    <Svg
      width="43"
      height="102"
      viewBox="0 0 43 102"
      fill="none"
      opacity={fill === '#14B17F' ? 0.8 : 1}
    >
      <Path d="M14.121 5.9428C15.2464 -0.0230745 22.9875 -1.70816 26.4909 3.25009V3.25009C27.0433 4.03178 27.4263 4.9202 27.6155 5.85846L41.9279 76.8439C44.5503 89.8504 34.6059 102 21.3376 102V102C8.17633 102 -1.74277 90.0347 0.697039 77.1016L14.121 5.9428Z" fill={fill} />
    </Svg>

  );
};

export default QiblaRowSvg;
