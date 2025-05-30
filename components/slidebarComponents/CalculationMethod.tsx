import { StyleSheet, View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import { useState } from 'react';
import { useGlobalContext } from '../../context/GlobalProvider';
import StandarButton from '../StandarBtn';
import { useTheme } from '../../context/ThemeContext';

export default function CalculationMethod() {
  const { theme } = useTheme();
  const [calculationMethod, setCalculationMethod] = useState('');

  const { setSlidebarActive } = useGlobalContext();

  const calculationMethods = [
    { label: 'Jafari / Shia Ithna-Ashari', value: 0 },
    { label: 'University of Islamic Sciences, Karachi', value: 1 },
    { label: 'Islamic Society of North America', value: 2 },
    { label: 'Muslim World League', value: 3 },
    { label: 'Umm Al-Qura University, Makkah', value: 4 },
    { label: 'Egyptian General Authority of Survey', value: 5 },
    { label: 'Institute of Geophysics, University of Tehran', value: 7 },
    { label: 'Gulf Region', value: 8 },
    { label: 'Kuwait', value: 9 },
    { label: 'Qatar', value: 10 },
    { label: 'Majlis Ugama Islam Singapura, Singapore', value: 12 },
    { label: 'Union Organization Islamic de France', value: 13 },
    { label: 'Diyanet İşleri Başkanlığı, Turkey', value: 14 },
    { label: 'Spiritual Administration of Muslims of Russia', value: 15 },
    { label: 'Moonsighting Committee Worldwide (requires shafaq)', value: 16 },
    { label: 'Dubai (experimental)', value: 17 },
    { label: 'Jabatan Kemajuan Islam Malaysia (JAKIM)', value: 18 },
    { label: 'Tunisia', value: 19 },
    { label: 'Algeria', value: 20 },
    { label: 'KEMENAG - Kementerian Agama Republik Indonesia', value: 21 },
    { label: 'Morocco', value: 22 },
    { label: 'Comunidade Islamica de Lisboa', value: 23 },
    { label: 'Ministry of Awqaf, Islamic Affairs and Holy Places, Jordan', value: 24 },
    { label: 'Custom', value: 99 },
  ];

  return (
    <View>
      <Text style={[{ color: Colors[theme].focusColor }, styles.textSelected]}>Settings</Text>
      <ThemedText style={styles.title}>Calculation Method</ThemedText>
      <ThemedText style={styles.subtitle}>We appreciate your time and effort for reporting an issue.</ThemedText>

      <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}>
        <Picker
          selectedValue={calculationMethod}
          onValueChange={(itemValue) => setCalculationMethod(itemValue)}
          style={{ color: Colors[theme].textColor }}
        >
          {calculationMethods.map((method) => (
            <Picker.Item key={method.value} label={method.label} value={method.value} />
          ))}
        </Picker>
      </View>

      <StandarButton onPress={() => setSlidebarActive(false)} style={[styles.submitBtn, { backgroundColor: Colors[theme].focusColor }]}>
        <Text style={styles.btnText}>Submit</Text>
      </StandarButton>
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
  pickerContainer: {
    height: 48,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 2,
    justifyContent: 'center',
  },
  submitBtn: {
    marginTop: 16,
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
