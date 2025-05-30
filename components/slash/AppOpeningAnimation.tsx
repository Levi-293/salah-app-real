import React, { useEffect, useState } from 'react';
import { StyleSheet} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import SpashSvg from './spashSvg';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';

const AppOpeningAnimation = () => {
  const [animationFinished, setAnimationFinished] = useState(false);
  const [showBackGround, setShowBackGround] = useState(false);

  const scaleValueTopRight = useSharedValue(1);
  const scaleValueBottomRight = useSharedValue(1);

  const topValueTopRight = useSharedValue(-220);
  const leftValueTopRight = useSharedValue(-220);
  const bottomValueBottomRight = useSharedValue(-220);
  const rightValueBottomRight = useSharedValue(-220);

  const opacityValue = useSharedValue(1); // New shared value for opacity

  const { theme } = useTheme();

  useEffect(() => {
    // Animación hacia adelante
    scaleValueTopRight.value = withTiming(3, { duration: 1000 });
    topValueTopRight.value = withTiming(100, { duration: 1000 });
    leftValueTopRight.value = withTiming(-90, { duration: 1000 });

    scaleValueBottomRight.value = withTiming(3, { duration: 1000 });
    bottomValueBottomRight.value = withTiming(20, { duration: 1000 });
    rightValueBottomRight.value = withTiming(100, { duration: 1000 });

    // Retrasar la animación inversa por 1 segundo
    const reverseAnimation = () => {
      scaleValueTopRight.value = withTiming(0, { duration: 1000 });
      topValueTopRight.value = withTiming(-200, { duration: 1000 });
      leftValueTopRight.value = withTiming(-200, { duration: 1000 });

      scaleValueBottomRight.value = withTiming(0, { duration: 1000 });
      bottomValueBottomRight.value = withTiming(-200, { duration: 1000 });
      rightValueBottomRight.value = withTiming(-200, { duration: 1000 });
      setShowBackGround(true);

      // Animación de desvanecimiento del contenedor
      opacityValue.value = withTiming(0, { duration: 1000 }, () => {
        runOnJS(setAnimationFinished)(true);
      });
    };

    // Ejecutar la animación inversa después de la animación hacia adelante
    const animationTimeout = setTimeout(reverseAnimation, 2000);

    return () => clearTimeout(animationTimeout); // Limpiar el timeout si el componente se desmonta
  }, []);

  const animatedStyleTopRight = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValueTopRight.value }],
    position: 'absolute',
    top: topValueTopRight.value,
    left: leftValueTopRight.value,
  }));

  const animatedStyleBottomRight = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValueBottomRight.value }],
    position: 'absolute',
    bottom: bottomValueBottomRight.value,
    right: rightValueBottomRight.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    display: opacityValue.value === 0 ? 'none' : 'flex',
  }));

  if (animationFinished) return null; // Eliminar el componente después de que la animación haya terminado

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle, { backgroundColor: showBackGround ? '#rgba(0,0,0,5)' : Colors[theme].background }]}>
      <Animated.View style={styles.box}>
        <Animated.View style={[styles.topRightSvg, animatedStyleTopRight]}>
          <SpashSvg fill={Colors[theme].focusColor} />
        </Animated.View>
        <Animated.View style={[styles.bottomRightSvg, animatedStyleBottomRight]}>
          <SpashSvg fill={Colors[theme].focusColor} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    position: 'relative',
  },
  topRightSvg: {
    position: 'absolute',
  },
  bottomRightSvg: {
    position: 'absolute',
  },
});

export default AppOpeningAnimation;
