import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import StandarButton from './StandarBtn';
import { useTheme } from '../context/ThemeContext';

interface SwitchProps {
  onPress: () => void;
  status: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Switch({ onPress, status, disabled = false, style }: SwitchProps) {
  const translateX = useSharedValue(0);
  const progress = useSharedValue(0);
  const { theme } = useTheme();

  useEffect(() => {
    if (status) {
      translateX.value = withTiming(15.5, { duration: 300 });
      progress.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(0, { duration: 300 });
      progress.value = withTiming(0, { duration: 300 });
    }
  }, [status, translateX, progress]);

  const animatedSwitchCircleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor: disabled ? '#E0E0E0' : '#FFFFFF',
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#C0C0C0', Colors[theme].focusColor]
    ),
    opacity: disabled ? 0.7 : 1,
  }));

  return (
    <StandarButton 
      onPress={disabled ? () => {} : onPress} 
      style={[styles.switchCont, style, disabled && styles.disabledContainer]} 
    >
      <Animated.View style={[styles.animatedCont, animatedBackgroundStyle]}>
        <Animated.View style={[styles.switchCircle, animatedSwitchCircleStyle]} />
      </Animated.View>
    </StandarButton>
  );
}

const styles = StyleSheet.create({
  switchCont: {
    height: 22,
    width: 38,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  animatedCont: {
    flex: 1,
    borderRadius: 14.9,
    paddingHorizontal: 1.3,
    justifyContent: 'center',
  },
  switchCircle: {
    height: 20,
    aspectRatio: 1 / 1,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});