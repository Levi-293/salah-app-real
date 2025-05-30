import { StyleSheet, View, Dimensions } from 'react-native';
import StarsDecoration from '../assets/svg/StarsDecoration';
import WabeDecoration from '../assets/svg/WabeDecoration';
import { useTheme } from '../context/ThemeContext';

export default function IndexDecoration() {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width + 20;

  return (
    <View style={[styles.container, { width: screenWidth }]}>
      {theme === 'light' ? <WabeDecoration /> : <StarsDecoration />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    transform: [{ translateX: - 0 }],
  },
});
