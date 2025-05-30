import { Svg, Path, Circle } from 'react-native-svg';

const SpashSvg = ({ fill }: { fill: string }) => {
  return (
    <Svg width="277" height="251" viewBox="0 0 277 251" fill="none" >
    <Circle cx="167.562" cy="155.151" r="95.5" transform="rotate(-166.821 167.562 155.151)" fill="#FF9141"/>
    <Circle cx="95.758" cy="154.77" r="95.5" transform="rotate(-166.821 95.758 154.77)" fill="#FF9141"/>
    <Path d="M88.4846 73.9846C100.51 22.6304 151.888 -9.25214 203.243 2.77282C254.597 14.7978 286.479 66.1767 274.454 117.531C262.429 168.885 211.05 200.767 159.696 188.743C108.342 176.718 76.4596 125.339 88.4846 73.9846Z" fill="#FF9141"/>
    </Svg>
    
  );
};

export default SpashSvg;
