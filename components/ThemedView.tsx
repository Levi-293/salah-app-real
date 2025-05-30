import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Asegúrate de importar el contexto correctamente
import { Colors } from '../constants/Colors';
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { theme } = useTheme(); // Obtén el valor del tema oscuro o claro

  // Selecciona el color de fondo basado en el tema actual
  const backgroundColor = Colors[theme].background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
