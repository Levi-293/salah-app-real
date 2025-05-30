import { StyleSheet, View, Text } from 'react-native';
import Switch from '../Switch';
import { useTheme } from '../../context/ThemeContext';
import { ThemedText } from '../ThemedText';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';

export default function Theme() {
  const { toggleTheme, isDarkTheme, theme } = useTheme();
  const opacityText = theme === 'light'
  ? .7
  : .5;
  
  return (  
    <View>
      <Text style={[{ color: Colors[theme].focusColor }, styles.textSelected]}>
        Settings
      </Text>
      <ThemedText style={styles.title}>Theme</ThemedText>
      <ThemedText style={styles.subtitle}>Please select the theme from the following categories</ThemedText>
      <View style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}>
        <ThemedText style={[styles.optionText, { opacity: opacityText }]}>Enable Dark mode</ThemedText>
        <Switch onPress={toggleTheme} status={isDarkTheme} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 16,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.6,
    marginBottom: 8,
  },
  textSelected: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionCont: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 16,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
