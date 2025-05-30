import Ionicons from '@expo/vector-icons/Ionicons';
import { type ComponentProps } from 'react';
import PlayerSvg from '../../assets/svg/PlayerSvg';
import PlayerSvgOutline from '../../assets/svg/PlayerSvgOutline';
import SettingsSvg from '../../assets/svg/SettingsSvg';
import SettingsSvgOutline from '../../assets/svg/SettingsSvgOutline';
import QiblaSvg from '../../assets/svg/qiblaSvg';
import TimingSvg from '../../assets/svg/timingSvg';

type IconNames = 'player' | 'player-outline' | 'Qibla' | 'Qibla-outline' | 'settings' | 'settings-outline' | 'timing' | 'timing-outline';

interface TabBarIconProps {
  color: string;
  name: IconNames;
}

export function TabBarIcon({ color, name }: TabBarIconProps) {
  switch (name) {
    case 'player':
      return <PlayerSvg fill={color} />;
    case 'player-outline':
      return <PlayerSvgOutline fill={color} />;
    case 'Qibla':
      return <QiblaSvg fill={color} />;
    case 'Qibla-outline':
      return <QiblaSvg fill={color} />;
    case 'settings':
      return <SettingsSvg fill={color} />;
    case 'settings-outline':
      return <SettingsSvgOutline fill={color} />;
    case 'timing':
      return <TimingSvg fill={color} />;
    case 'timing-outline':
      return <TimingSvg fill={color} />;
    default:
      return <Ionicons name="alert-circle" size={28} color={color} />;
  }
}
