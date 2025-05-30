import { Text, type TextProps, StyleSheet } from 'react-native';

import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'| 'opacitySemiBold' | 'littleText';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { theme } = useTheme();
  var color = Colors[theme].textColor;
  if(lightColor && darkColor){
    color = theme === 'dark' ? darkColor : lightColor;
  }else{
    color = Colors[theme].textColor;
  }
  

  return (
    <Text
      style={[
        { color },
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'default' ? styles.default : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'opacitySemiBold' ? styles.opacitySemiBold : undefined,
        type === 'littleText' ? styles.littleText : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '600',
  },
  opacitySemiBold: {
    fontSize: 12,
    fontWeight: '600',
    opacity:.5
  },
  littleText: {
    fontSize: 10,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  link: {
    fontSize: 16,
    color: '#0a7ea4',
  },
});
