import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text, StyleSheet, View, SafeAreaView, Animated, TouchableOpacity, Image } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import QiblaRowSvg from '../../assets/svg/QiblaRowSvg';
import QiblaIconSvg from '../../assets/svg/QiblaIconSvg';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';
import { useGlobalContext } from '../../context/GlobalProvider';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import logger from '@/utils/logger';

const COMPASS_UPDATE_INTERVAL = 100; // ms
const ANGLE_THRESHOLD = 1; // degrees
const FACING_THRESHOLD = 5; // degrees, increased for a bit more lenience
const SMOOTHING_FACTOR = 0.2; // Adjust this value to change smoothing (0-1)

export default function TabTwoScreen() {
  const navigation = useNavigation();
  const [heading, setHeading] = useState(new Animated.Value(0));
  const [directionText, setDirectionText] = useState('');
  const [facingMakkah, setFacingMakkah] = useState(false);
  const magnetometerSubscription = useRef(null);
  const lastAngle = useRef(0);
  const hasUpdatedQiblaPosition = useRef(false);

  const { 
    city,
    declination,
    qiblaDirection, 
    locationAllowed,
    updateQiblaPosition,
    hapticFeedback,
    useSlidebar,
    setSlidebarSelected
  } = useGlobalContext();
  const { theme } = useTheme();
 
  const themeBackgroundColor = theme === 'dark' ? '#FFF' : 'rgba(0,0,0,.1)';

  const updateQiblaPositionOnce = useCallback(() => {
    if (!hasUpdatedQiblaPosition.current) {
      updateQiblaPosition();
      hasUpdatedQiblaPosition.current = true;
    }
  }, [updateQiblaPosition]);

  useEffect(() => {
    logger.info('Qibla page is loaded')

    if (locationAllowed) {
      updateQiblaPositionOnce();
    }
  }, [locationAllowed, updateQiblaPositionOnce]);

  const normalizeAngle = (angle) => {
    return (angle + 360) % 360;
  };

  const smoothAngle = (newAngle, lastAngle) => {
    let diff = newAngle - lastAngle;
    if (diff > 180) {
      diff -= 360;
    } else if (diff < -180) {
      diff += 360;
    }
    return normalizeAngle(lastAngle + SMOOTHING_FACTOR * diff);
  };

  const updateCompassDirection = (angle) => {
    const smoothedAngle = smoothAngle(angle, lastAngle.current);
    lastAngle.current = smoothedAngle;

    if (Math.abs(normalizeAngle(smoothedAngle - heading.__getValue())) > ANGLE_THRESHOLD) {
      Animated.spring(heading, {
        toValue: smoothedAngle,
        useNativeDriver: true,
        friction: 5,
        tension: 0.8,
      }).start();

      let angleDifference = normalizeAngle(qiblaDirection - smoothedAngle);
      const turnDirection = angleDifference <= 180 ? 'Right' : 'Left';
      if (angleDifference > 180) {
        angleDifference = 360 - angleDifference;
      }

      const isFacingQibla = angleDifference <= FACING_THRESHOLD;
      setFacingMakkah(isFacingQibla);

      if (isFacingQibla) {
        setDirectionText('');
        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      } else {
        const turnAngle = Math.min(angleDifference, 360 - angleDifference);
        setDirectionText(`Turn ${turnDirection} (${Math.round(turnAngle)}°)`);
        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const subscribeToMagnetometer = async () => {
        magnetometerSubscription.current = Magnetometer.addListener((data) => {
          let angle = getDegree(getAngle(data)) + declination;
          updateCompassDirection(angle);
        });

        await Magnetometer.setUpdateInterval(COMPASS_UPDATE_INTERVAL);
      };

      subscribeToMagnetometer();

      return () => {
        if (magnetometerSubscription.current) {
          magnetometerSubscription.current.remove();
        }
      };
    }, [qiblaDirection, declination, hapticFeedback])
  );

  const getAngle = (magnetometer) => {
    let angle = 0;
    if (magnetometer) {
        const { x, y } = magnetometer;
        if (Math.atan2(y, x) >= 0) {
            angle = Math.atan2(y, x) * (180 / Math.PI);
        } else {
            angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
        }
    }
    return Math.round(angle);
  };

  const getDegree = (magnetometer) => {
    return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
  };

  const rotateCompass = heading.interpolate({
    inputRange: [0, 360],
    outputRange: ['360deg', '0deg'],
  });

  const navigateToQiblaTooltip = () => {
    setSlidebarSelected('Qibla Tooltip');
    useSlidebar();
  };

  const Instructions = () => (
    <View style={styles.dosDonts}>
      <View style={styles.instruction}>
        <Image
          source={require('../../assets/images/do-icon.png')}
          style={styles.instructionIcon}
        />
        <ThemedText type="caption" style={styles.instructionText}>
          Place the phone flat or on flat surface
        </ThemedText>
      </View>
      <View style={styles.instruction}>
        <Image
          source={require('../../assets/images/dont-icon.png')}
          style={styles.instructionIcon}
        />
        <ThemedText type="caption" style={styles.instructionText}>
          Don't hold the phone on tilt or upright
        </ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.mainCont, { backgroundColor: Colors[theme].background }]}>
      {Instructions()}
      <TouchableOpacity style={styles.infoIcon} onPress={navigateToQiblaTooltip}>
        <Ionicons name="information-circle-outline" size={24} color={Colors[theme].text} />
      </TouchableOpacity>
      <View style={styles.compass}>
        <View style={styles.QiblaRowSvg}>
          <QiblaRowSvg fill={Colors[theme].focusColor} />
        </View>

        <Animated.View style={[styles.compassCont, { backgroundColor: themeBackgroundColor, transform: [{ rotate: rotateCompass }] }]}>
          <Text style={[styles.compassText, styles.wText]}>W</Text>
          <Text style={[styles.compassText, styles.sText]}>S</Text>
          <Text style={[styles.compassText, styles.nText]}>N</Text>
          <Text style={[styles.compassText, styles.eText]}>E</Text>
          {qiblaDirection !== null && (
            <View style={[styles.qiblaIcon, { transform: [{ rotate: `${qiblaDirection}deg` }] }]}>
              <QiblaIconSvg width={40} height={40} />
            </View>
          )}
        </Animated.View>
      </View>
      <ThemedText type="subtitle" style={{ marginBottom: 5 }}>
        Your Location
      </ThemedText>
      <ThemedText type="title" lightColor="#14B17F" darkColor="#FF9141">
        {city}
      </ThemedText>
      {directionText ? (
        <ThemedText type="subtitle" style={{ marginTop: 10 }}>
          {directionText}
        </ThemedText>
      ) : null}
      {facingMakkah && (
        <ThemedText type="title" style={{ marginTop: 10, color: '#14B17F' }}>
          You are facing Makkah
        </ThemedText>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  QiblaRowSvg: {
    position: 'absolute',
    zIndex: 1,
    transform: [{ translateY: -30 }],
  },
  mainCont: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compass: {
    width: '78%',
    aspectRatio: 1,
    borderRadius: 150,
    maxWidth: 306,
    maxHeight: 306,
    backgroundColor: 'rgba(240,228,229,.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 150,
    marginBottom: 40,
  },
  compassCont: {
    position: 'relative',
    width: '84%',
    aspectRatio: 1,
    maxWidth: 312,
    borderRadius: 150,
  },
  compassText: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 20,
    fontWeight: '600',
    position: 'absolute',
  },
  eText: {
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  sText: {
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -5 }],
  },
  nText: {
    top: 10,
    left: '50%',
    transform: [{ translateX: -5 }],
  },
  wText: {
    left: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  qiblaIcon: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    zIndex: 10,
  },
  infoIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  dosDonts: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    position: 'absolute',
    top: 40,
    zIndex: 10,
    width: '50%', // Total width for both instructions
  },
  instruction: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '50%', // 25% width for each instruction
    padding: 4,
  },
  instructionIcon: {
    width: 36,
    height: 36,
    marginBottom: 8,
  },
  instructionText: {
    textAlign: 'left',
  },
});