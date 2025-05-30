import { Svg, Path, Rect } from 'react-native-svg';

const RigthArrowSvg = ({ fill }: { fill: string }) => {
  return (
    <Svg width="16" height="29" viewBox="0 0 16 29" fill="none">
      <Path d="M2 26.5L14 14.5L2 2.5" stroke={fill}stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    </Svg>
  );
};

export default RigthArrowSvg;
