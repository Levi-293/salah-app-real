import { Svg, Path } from 'react-native-svg';

const ShareConfigSvg = ({ fill }: { fill: string }) => {
  return (
    <Svg width="22" height="22" viewBox="0 0 22 22" fill="none" >
<Path d="M21 7.66667L21 1M21 1H14.3333M21 1L12.1111 9.88889M8.77778 3.22222H6.33333C4.46649 3.22222 3.53307 3.22222 2.82003 3.58553C2.19282 3.90511 1.68289 4.41505 1.36331 5.04225C1 5.75529 1 6.68871 1 8.55556V15.6667C1 17.5335 1 18.4669 1.36331 19.18C1.68289 19.8072 2.19282 20.3171 2.82003 20.6367C3.53307 21 4.46649 21 6.33333 21H13.4444C15.3113 21 16.2447 21 16.9577 20.6367C17.585 20.3171 18.0949 19.8072 18.4145 19.18C18.7778 18.4669 18.7778 17.5335 18.7778 15.6667V13.2222" stroke={fill} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</Svg>


  );
};

export default ShareConfigSvg;
