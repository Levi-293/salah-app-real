import { StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/Colors';
import StandarButton from './StandarBtn';
import { useTheme } from '../context/ThemeContext';
interface DateScrollCompProps {
  first?: string;
  second?: string;
  third?: string;
  active: boolean;
  onClick: void
}

export default function ScrollComp({
  first,
  second,
  third,
  active,
  onClick  
}: DateScrollCompProps) {
  const { theme } = useTheme();

  // Define the background color based on active status and color scheme
  const backgroundColor = active
    ? Colors[theme].focusColor
    : theme === 'light'
    ? 'rgba(240, 242, 242, .15)'
    : 'rgba(69, 69, 69, .5)';

  const borderColor = active
    ? Colors[theme].focusColor
    : theme === 'light'
    ? '#A8A9A9'
    : 'rgba(69, 69, 69, .5)';

  const color = active
    ? '#FFF'
    : theme === 'light'
    ? '#A8A9A9'
    : 'rgba(255, 255, 255, .7)';

  return (
    <StandarButton onPress={onClick} style={[styles.mainCont, { backgroundColor, borderColor }]}>
      {first && <Text style={[styles.text, { color }]}>{first}</Text>}
      {second && <Text style={[styles.mainText, { color }]}>{second}</Text>}
      {third && <Text style={[styles.text, { color }]}>{third}</Text>}
    </StandarButton>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    width: 62,
    borderWidth: 2,
    backgroundColor: 'red', // This will be overridden by the inline style
  },
  text: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  mainText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});
