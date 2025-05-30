import React from 'react';
import { Svg, Path, Defs, ClipPath, Rect, G, Circle } from 'react-native-svg';

const TimingSvg = ({ fill }: { fill: string }) => {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none" >
<Path d="M18.2676 11.054C18.3112 10.7087 18.3337 10.3569 18.3337 9.99984C18.3337 5.39746 14.6027 1.6665 10.0003 1.6665C5.39795 1.6665 1.66699 5.39746 1.66699 9.99984C1.66699 14.6022 5.39795 18.3332 10.0003 18.3332C10.3632 18.3332 10.7206 18.31 11.0712 18.265M10.0003 4.99984V9.99984L13.1156 11.5575M15.8337 18.3332V13.3332M13.3337 15.8332H18.3337" stroke={fill} stroke-opacity="0.4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</Svg>
  );
};

export default TimingSvg;
