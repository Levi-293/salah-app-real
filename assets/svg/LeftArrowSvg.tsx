import { Svg, Path } from 'react-native-svg';

const LeftArrowSvg = ({ fill }: { fill: string }) => {
  return (
    <Svg width="16" height="29" viewBox="0 0 16 29" fill="none" >
      <Path d="M14 26.5L2 14.5L14 2.5" stroke={fill} stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </Svg>
  );
};

export default LeftArrowSvg;
