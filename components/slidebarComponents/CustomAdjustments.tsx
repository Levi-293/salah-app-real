import { StyleSheet, View, Text, TextInput } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import { useState } from 'react';
import { useGlobalContext } from '../../context/GlobalProvider';
import StandarButton from '../StandarBtn';
import { useTheme } from '../../context/ThemeContext';

export default function CustomAdjustments() {
  const { theme } = useTheme();
  const { setCustomMinutes, setSlidebarActive } = useGlobalContext();

  // Estado local para almacenar los minutos temporalmente
  const [localMinutes, setLocalMinutes] = useState({
    Fajr: '',
    Sunrise: '',
    Dhuhr: '',
    Asr: '',
    Maghrib: '',
    Isha: '',
  });

  // Función para manejar el cambio de texto
  const handleInputChange = (name, value) => {
    // Filtrar solo los dígitos del valor ingresado (excluir comas, puntos, etc.)
    const filteredValue = value.replace(/[^0-9]/g, '');
    setLocalMinutes((prev) => ({
      ...prev,
      [name]: filteredValue,
    }));
  };

  // Función para guardar los datos al presionar el botón
  const handleSubmit = () => {
    setCustomMinutes(localMinutes); // Guardar los valores en customMinutes
    setSlidebarActive(false); // Navegar o realizar otra acción
  };

  return (
    <View>
      <Text style={[{ color: Colors[theme].focusColor }, styles.textSelected]}>Settings</Text>
      <ThemedText style={styles.title}>Custom Adjustments</ThemedText>
      <ThemedText style={styles.subtitle}>We appreciate your time and effort for reporting an issue.</ThemedText>
      
      <TextInput
        style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor, color: Colors[theme].textColor }]}
        placeholder="Fajr"
        keyboardType='numeric'
        placeholderTextColor={Colors[theme].placeholderColor}
        onChangeText={(value) => handleInputChange('Fajr', value)}
        value={localMinutes.Fajr}
      />
      <TextInput
        style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor, color: Colors[theme].textColor }]}
        placeholder="Sunrise"
        keyboardType='numeric'
        placeholderTextColor={Colors[theme].placeholderColor}
        onChangeText={(value) => handleInputChange('Sunrise', value)}
        value={localMinutes.Sunrise}
      />
      <TextInput
        style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor, color: Colors[theme].textColor }]}
        placeholder="Dhuhr"
        keyboardType='numeric'
        placeholderTextColor={Colors[theme].placeholderColor}
        onChangeText={(value) => handleInputChange('Dhuhr', value)}
        value={localMinutes.Dhuhr}
      />
      <TextInput
        style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor, color: Colors[theme].textColor }]}
        placeholder="Asr"
        keyboardType='numeric'
        placeholderTextColor={Colors[theme].placeholderColor}
        onChangeText={(value) => handleInputChange('Asr', value)}
        value={localMinutes.Asr}
      />
      <TextInput
        style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor, color: Colors[theme].textColor }]}
        placeholder="Maghrib"
        keyboardType='numeric'
        placeholderTextColor={Colors[theme].placeholderColor}
        onChangeText={(value) => handleInputChange('Maghrib', value)}
        value={localMinutes.Maghrib}
      />
      <TextInput
        style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor, color: Colors[theme].textColor }]}
        placeholder="Isha"
        keyboardType='numeric'
        placeholderTextColor={Colors[theme].placeholderColor}
        onChangeText={(value) => handleInputChange('Isha', value)}
        value={localMinutes.Isha}
      />
      
      <StandarButton onPress={handleSubmit} style={[styles.submitBtn,{backgroundColor:Colors[theme].focusColor}]}>
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
    opacity: .6,
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
    flexDirection: 'row',
    marginTop: 16,
    borderWidth: 2,
  },
  textarea:{
    height: 145,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    textAlignVertical: 'top',
    paddingVertical:16
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn:{
    marginTop: 16,
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  btnText:{
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  }
});
