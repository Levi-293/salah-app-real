import { Svg, Path } from 'react-native-svg';

const PlayerSvg = ({ fill }: { fill: string }) => {
  return (
    <Svg width="13" height="21" viewBox="0 0 13 21" fill="none">
      <Path
        d="M1 1.56055V2.56055V3.56055V6.06055L0 10.0605V14.0605L0.5 17.0605V18.5605L1 19.0605L2 20.5605H5H10.5C11.3 20.5605 12.1667 20.2272 12.5 20.0605V18.5605L12 16.5605L8.5 14.5605L4.5 8.56055L4 5.56055L5 4.06055L4.5 0.560547H2.5L1 1.56055Z"
        fill={fill}
      />
    </Svg>
  );
};

export default PlayerSvg;
