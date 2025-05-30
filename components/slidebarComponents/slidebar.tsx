import React, { useEffect, useState, ReactNode } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, Dimensions, Keyboard, ScrollView } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { useGlobalContext } from '../../context/GlobalProvider';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useAnimatedGestureHandler,
  Easing,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import StandarButton from '../StandarBtn';

interface SlideBarProps {
  status: boolean;
  children: ReactNode;
}

export default function SlideBar({ status, children }: SlideBarProps) {
  const { useSlidebar, locationAllowed, setSettingLastUpdate, slidebarSelected } = useGlobalContext();

  const translateY = useSharedValue(624); // Initialize to MAX_TRANSLATE_Y
  const opacity = useSharedValue(0);
  const [display, setDisplay] = useState<'flex' | 'none'>('flex'); // Initialize to 'flex'
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const DISMISS_THRESHOLD = 100;
  const MAX_TRANSLATE_Y = 624; // Maximum translation value

  useEffect(() => {
    const showKeyboardListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideKeyboardListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showKeyboardListener.remove();
      hideKeyboardListener.remove();
    };
  }, []);

  useEffect(() => {
    if (status) {
      setDisplay('flex');
      translateY.value = withTiming(keyboardVisible ? -150 : 0, { duration: 300, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else {
      translateY.value = withTiming(MAX_TRANSLATE_Y, { 
        duration: 300, 
        easing: Easing.in(Easing.cubic) 
      }, () => {
        runOnJS(setDisplay)('none');
      });
      opacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) });
    }
  }, [status, keyboardVisible, translateY, opacity]);

  const onClosePage = () => {
    if (slidebarSelected === 'Prayer Times') {
      // // console.log('Prayer times slidebar closed');
      setSettingLastUpdate(Date.now());
    }
    useSlidebar();
  }

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startY: number }
  >({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      const newTranslateY = ctx.startY + event.translationY;
      translateY.value = Math.max(0, Math.min(newTranslateY, MAX_TRANSLATE_Y));
      opacity.value = 1 - (translateY.value / MAX_TRANSLATE_Y);
    },
    onEnd: (event) => {
      if (locationAllowed && (event.translationY > DISMISS_THRESHOLD || event.velocityY > 500)) {
        translateY.value = withTiming(MAX_TRANSLATE_Y, { 
          duration: 300, 
          easing: Easing.out(Easing.cubic) 
        }, () => {
          runOnJS(onClosePage)();
        });
        opacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      } else {
        translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
        opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      }
    },
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: `rgba(0,0,0,${opacity.value * 0.5})`,
    };
  });

  const windowHeight = Dimensions.get('window').height;
  const calculatedHeight = windowHeight - MAX_TRANSLATE_Y;
  
  return (
    <Animated.View style={[styles.container, animatedBackgroundStyle, { display }]}>
      <StandarButton onPress={onClosePage} style={{ height: calculatedHeight }}>
        <View />
      </StandarButton>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.slideContainer, animatedContainerStyle]}>
          <ThemedView style={styles.mainCont}>
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={styles.handleContainer}>
                <View style={styles.slidebarLine} />
              </Animated.View>
            </PanGestureHandler> 
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </ThemedView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    zIndex: 100,
    position: 'absolute',
    bottom: 0,
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  slideContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  mainCont: {
    height: 624,
    borderTopEndRadius: 16,
    borderTopLeftRadius: 16,
    paddingHorizontal: 22,
    position: 'relative',
  },
  handleContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slidebarLine: {
    width: 139,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#C0C0C0',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
});