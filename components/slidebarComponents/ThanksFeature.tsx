import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import { useTheme } from '../../context/ThemeContext';

export default function ThanksFeature() {
  const { theme } = useTheme();
  const opacityText = theme === 'light'
    ? .7
    : .7;

  return (
    <View>
      <Text style={[{ color: Colors[theme].focusColor }, styles.textSelected]}>Settings</Text>
      <ThemedText style={styles.title}>Thank you for your request</ThemedText>
      <ThemedText style={styles.subtitle}>We appreciate your time and effort for requesting a feature.</ThemedText>
      <ScrollView style={[{ opacity: opacityText, maxHeight:520, }]}>
        <ThemedText style={styles.optionText}>
        Thank you for requesting a feature. Your submission has been successfully received. Our support team will review your request and get back to you within 5 working days. For further assistance, you can contact us at support@salahguide.app.
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 500,
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 16,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    opacity: .6,
    marginBottom: 8
  },
  textSelected: {
    fontSize: 12,
    fontWeight: '500'
  },
  optionCont: {
    flex: 1,
    height: 'auto',
    marginTop: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop:16,
    textAlign:'center'
  }
});



