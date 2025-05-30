import React from 'react';
import { Text } from 'react-native';
import { ThemedText } from './ThemedText';

const FormattedText = ({ children, style }) => {
  const parts = children.split(/(\{bold\}.*?\{\/bold\})/);
  return (
    <ThemedText style={style}>
      {parts.map((part, index) => {
        if (part.startsWith('{bold}') && part.endsWith('{/bold}')) {
          return (
            <Text key={index} style={{ fontWeight: '900' }}>
              {part.slice(6, -7)}
            </Text>
          );
        }
        return part;
      })}
    </ThemedText>
  );
};

export default FormattedText;