import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import Switch from '../Switch';
import { useGlobalContext } from '../../context/GlobalProvider';
import { useTheme } from '../../context/ThemeContext';

export default function Notifications() {
  const { theme } = useTheme();
  const { changeNotificationConfig, notification } = useGlobalContext();
  const opacityText = theme === 'light'
    ? .7
    : .5;


  return (
    <View>
      <Text style={[{ color: Colors[theme].focusColor }, styles.textSelected]}>Settings</Text>
      <ThemedText style={styles.title}>Notifications</ThemedText>
      <ThemedText style={styles.subtitle}>Please select which types of notifications you would like to receive</ThemedText>
      <View style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}>
        <ThemedText style={[styles.optionText, { opacity: opacityText }]}>Enable Notifications</ThemedText>
        <Switch onPress={()=>changeNotificationConfig()} status={notification} />
      </View>
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
    marginBottom: 8,
  },
  textSelected: {
    fontSize: 12,
    fontWeight: '500'
  },
  optionCont: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 16,
    borderWidth: 2
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600'
  }
});
