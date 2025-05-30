import { StyleSheet, View, Text, usetheme, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import { useTheme } from '../../context/ThemeContext';

export default function FAQ() {
  const { theme } = useTheme();
  const opacityText = theme === 'light'
    ? .7
    : .7;

  return (
    <View>
      <Text style={[{ color: Colors[theme].focusColor }, styles.textSelected]}>Settings</Text>
      <ThemedText style={styles.title}>FAQs & Feedback</ThemedText>
      <ThemedText style={styles.subtitle}>Here are any other setting for the app you can adjust.</ThemedText>
      <ScrollView style={[{ opacity: opacityText, maxHeight:520, }]}>
        <ThemedText style={styles.optionText}>
          What is Lorem Ipsum?
        </ThemedText>
        <ThemedText style={styles.optionText}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
        </ThemedText>
        <ThemedText style={styles.optionText}>
        Why do we use it?
        </ThemedText>
        <ThemedText style={styles.optionText}>
        It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
        </ThemedText>
        <ThemedText style={styles.optionText}>
        Where does it come from?
        </ThemedText>
        <ThemedText style={styles.optionText}>
        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.
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
    fontSize: 14,
    fontWeight: '600',
    paddingVertical:4
  }
});



