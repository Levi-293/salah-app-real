import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Animated, ScrollView, TouchableOpacity, Modal, FlatList, Linking } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import Switch from '../Switch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../../context/GlobalProvider';
import StandarButton from '../StandarBtn';
import { timings } from '../../config/offset';
import { useTheme } from '../../context/ThemeContext';
import FormattedText from '../../components/FormattedText';
import { AutoTimingData } from "../../config/httprouter";

export default function PrayerTimes() {
  const scrollViewRef = useRef(null);
  const { theme } = useTheme();
  const [madhabOptionActive, setMadhabOptionActive] = useState(false);
  const [customAdjustmentsActive, setCustomAdjustmentsActive] = useState(false);
  const [customAnglesActive, setCustomAnglesActive] = useState(false);
  const [highAltitudeOptionActive, setHighAltitudeOptionActive] = useState(false);
  const [isCalculationMethodModalVisible, setCalculationMethodModalVisible] = useState(false);
  
  const highAltitudeMethods = [
    { id: 1, name: "Middle of the night" },
    { id: 2, name: "One seventh" },
    { id: 3, name: "Angle based" }
  ];
  const calculationMethods = [
    { id: 0, name: "Jafari / Shia Ithna-Ashari" },
    { id: 1, name: "University of Islamic Sciences, Karachi" },
    { id: 2, name: "Islamic Society of North America" },
    { id: 3, name: "Muslim World League" },
    { id: 4, name: "Umm Al-Qura University, Makkah" },
    { id: 5, name: "Egyptian General Authority of Survey" },
    { id: 6, name: "Islamic Society of North America (ISNA)" },
    { id: 7, name: "Institute of Geophysics, University of Tehran" },
    { id: 8, name: "Gulf Region" },
    { id: 9, name: "Kuwait" },
    { id: 10, name: "Qatar" },
    { id: 11, name: "Majlis Ugama Islam Singapura, Singapore" },
    { id: 12, name: "Union Organization islamic de France" },
    { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey" },
    { id: 14, name: "Spiritual Administration of Muslims of Russia" },
    { id: 15, name: "Moonsighting Committee Worldwide" },
    { id: 16, name: "Dubai (experimental)" },
    { id: 17, name: "Jabatan Kemajuan Islam Malaysia (JAKIM)" },
    { id: 18, name: "Tunisia" },
    { id: 19, name: "Algeria" },
    { id: 20, name: "KEMENAG - Kementerian Agama Republik Indonesia" },
    { id: 21, name: "Morocco" },
    { id: 22, name: "Comunidade Islamica de Lisboa" },
    { id: 23, name: "Ministry of Awqaf, Islamic Affairs and Holy Places, Jordan" }
  ];

  const { 
    is12HourPrayerTimeFormatEnabled, 
    set12HourPrayerTimeFormatEnabled, 
    handleMadhabChange, 
    latitude,
    longitude,
    madhab, 
    calculationMethod, 
    country,
    isAutoDetectEnabled,
    setAutoDetectEnabled,
    isAutopilotEnabled,
    setAutopilotEnabled,
    isAlwaysLocationPermissionEnabled,
    setAlwaysLocationPermissionEnabled,
    isAutomaticLocationPermissionEnabled,
    setAutomaticLocationPermissionEnabled,
    locationAllowed,
    setSlidebarSelected,
    setSlidebarActive,
    customAdjustments,
    setCustomAdjustments,
    customAngles,
    setCustomAngles,
    selectedCalculationMethod,
    setSelectedCalculationMethod,
    highAltitudeMethod,
    setHighAltitudeMethod,
    setCalculationMethod
  } = useGlobalContext();

  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedTop = useRef(new Animated.Value(0)).current;

  const formatPrayerDateString = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: madhabOptionActive ? 150 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
    Animated.timing(animatedTop, {
      toValue: madhabOptionActive ? 8 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  }, [madhabOptionActive]);

  const animatedAnglesHeight = useRef(new Animated.Value(0)).current;
  const animatedAdjustmentsHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedAnglesHeight, {
      toValue: customAnglesActive ? 150 : 0, // Adjusted height
      duration: 200,
      useNativeDriver: false
    }).start();

    if (customAnglesActive && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [customAnglesActive]);

  useEffect(() => {
    Animated.timing(animatedAdjustmentsHeight, {
      toValue: customAdjustmentsActive ? 350 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();

    if (customAdjustmentsActive && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [customAdjustmentsActive]);

  const animatedHighAltitudeHeight = useRef(new Animated.Value(0)).current;
  const animatedHighAltitudeTop = useRef(new Animated.Value(0)).current;

  const handleCalculationMethodChange = async (method) => {
    setSelectedCalculationMethod(method.id);
    setCalculationMethodModalVisible(false);

    const offsetData = timings[method.id];
    setCustomAngles({
      Fajr: offsetData.Fajr.angle,
      Isha: offsetData.Isha.angle
    });
    await AsyncStorage.setItem('customAngles', JSON.stringify(customAngles));

    setCustomAdjustments({
      Fajr: offsetData.Fajr.minutes,
      Sunrise: offsetData.Sunrise.minutes,
      Dhuhr: offsetData.Dhuhr.minutes,
      Asr: offsetData.Asr.minutes,
      Maghrib: offsetData.Maghrib.minutes,
      Isha: offsetData.Isha.minutes
    });
    await AsyncStorage.setItem('customAdjustments', JSON.stringify(customAdjustments));

    try {
      await AsyncStorage.setItem('selectedCalculationMethod', JSON.stringify(method.id));
    } catch (error) {
      console.error('Error saving selectedCalculationMethod state', error);
    }
  };

  const renderCalculationMethodItem = ({ item }) => (
    <StandarButton
      onPress={() => handleCalculationMethodChange(item)}
      style={[
        styles.calculationMethodItem,
        { 
          backgroundColor: Colors[theme].opacityBtn,
          borderColor: selectedCalculationMethod === item.id ? Colors[theme].focusColor : Colors[theme].borderColor,
          borderWidth: 2,
        }
      ]}
    >
      <ThemedText style={[
        styles.calculationMethodText,
        { 
          color: selectedCalculationMethod === item.id ? Colors[theme].focusColor : Colors[theme].textColor,
          opacity: selectedCalculationMethod === item.id ? 1 : 0.7,
        }
      ]}>
        {item.name}
      </ThemedText>
    </StandarButton>
  );

  useEffect(() => {
    if (isAutoDetectEnabled) return;
    Animated.timing(animatedHighAltitudeHeight, {
      toValue: highAltitudeOptionActive ? 150 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
    Animated.timing(animatedHighAltitudeTop, {
      toValue: highAltitudeOptionActive ? 8 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  }, [highAltitudeOptionActive]);

  const handleHighAltitudeMethodChange = async (method: number) => {
    setHighAltitudeMethod(method);
    setHighAltitudeOptionActive(false);
    try {
      await AsyncStorage.setItem('highAltitudeMethod', JSON.stringify(method));
    } catch (error) {
      console.error('Error saving highAltitudeMethod state', error);
    }
  };

  const opacityText = theme === 'light' ? .7 : .7;
  const opacityDescription = .6;

  const calculationName = country == 'United Kingdom' ? 'Moonsighting Committee Worldwide' : calculationMethod.name;
  const calculationId = country == 'United Kingdom' ? 15 : calculationMethod.id;
  const autoDetectMessage = () => {
    if (isAutoDetectEnabled) {
      return `Prayer times are based on the {bold}${calculationName}{/bold} which is the most common setting in your location of {bold}${country}{/bold}`;
    }
    return "Your prayer times are based on the following {bold}manually selected{/bold} calculation method settings.";
  }
  const offsetData = timings[calculationId];

  const onCustomAdjustmentsPressed = () => {
    if (isAutoDetectEnabled) return;
    setCustomAdjustmentsActive(!customAdjustmentsActive);
  };

  const handleCustomAngleChange = async (angle, increment) => {
    const newAngles = {
      ...customAngles,
      [angle]: Math.max(9.0, Math.min(18.5, parseFloat((customAngles[angle] + increment).toFixed(1))))
    };
    setCustomAngles(newAngles);
    try {
      await AsyncStorage.setItem('customAngles', JSON.stringify(newAngles));
    } catch (error) {
      console.error('Error saving customAngles state', error);
    }
  };

  const onCustomAnglesPressed = () => {
    if (isAutoDetectEnabled) return;
    setCustomAnglesActive(!customAnglesActive);
  };

  const handlePrayerTimeFormatDisplaySettingChange = async () => {
    try {
      await AsyncStorage.setItem('is12HourPrayerTimeFormatEnabled', JSON.stringify(!is12HourPrayerTimeFormatEnabled));
      set12HourPrayerTimeFormatEnabled(!is12HourPrayerTimeFormatEnabled);
    } catch (error) {
      console.error('Error saving notifications state', error);
    }
  };

  const handleAutopilotChange = async () => {
    try {
      if (!isAutopilotEnabled) {
        await AsyncStorage.setItem('isAlwaysLocationPermissionEnabled', JSON.stringify(true));
        await AsyncStorage.setItem('isAutomaticLocationPermissionEnabled', JSON.stringify(true));
        await AsyncStorage.setItem('isAutoDetectEnabled', JSON.stringify(true));
      }
      await AsyncStorage.setItem('isAutopilotEnabled', JSON.stringify(!isAutopilotEnabled));

      if (!isAutopilotEnabled) {
        await fetchAutoDetectData();

        setAlwaysLocationPermissionEnabled(true);
        setAutomaticLocationPermissionEnabled(true);
        setAutoDetectEnabled(true);
        setCustomAdjustmentsActive(false);
        setCustomAnglesActive(false);
        setHighAltitudeOptionActive(false);
      }
      setAutopilotEnabled(!isAutopilotEnabled);

    } catch (error) {
      console.error('Error saving notifications state', error);
    }
  }

  const fetchAutoDetectData = async () => {
    const date = new Date();
    const formattedDate = formatPrayerDateString(date);
    const response = await AutoTimingData(formattedDate, latitude, longitude, madhab, country);
    setCalculationMethod(response.data.data.meta.method);
    const methodId = response.data.data.meta.method.id;
    
    setSelectedCalculationMethod(methodId);
    await AsyncStorage.setItem('selectedCalculationMethod', JSON.stringify(methodId));
    
    const altitudeMethod = response.data.data.meta.latitudeAdjustmentMethod;
    if (altitudeMethod === "MIDDLE_OF_THE_NIGHT") {
      setHighAltitudeMethod(1);
      await AsyncStorage.setItem('highAltitudeMethod', JSON.stringify(1));
    } else if (altitudeMethod === "ONE_SEVENTH") {
      setHighAltitudeMethod(2);
      await AsyncStorage.setItem('highAltitudeMethod', JSON.stringify(2));
    } else if (altitudeMethod === "ANGLE_BASED") {
      setHighAltitudeMethod(3);
      await AsyncStorage.setItem('highAltitudeMethod', JSON.stringify(3));
    }

    setCustomAngles({
      Fajr: offsetData.Fajr.angle,
      Isha: offsetData.Isha.angle
    });
    await AsyncStorage.setItem('customAngles', JSON.stringify(customAngles));

    setCustomAdjustments({
      Fajr: offsetData.Fajr.minutes,
      Sunrise: offsetData.Sunrise.minutes,
      Dhuhr: offsetData.Dhuhr.minutes,
      Asr: offsetData.Asr.minutes,
      Maghrib: offsetData.Maghrib.minutes,
      Isha: offsetData.Isha.minutes
    });
    await AsyncStorage.setItem('customAdjustments', JSON.stringify(customAdjustments));
  }

  const handleAutoDetectChange = async () => {
    try {
      if (!isAutoDetectEnabled) {
        setCustomAdjustmentsActive(false);
        setCustomAnglesActive(false);
        setHighAltitudeOptionActive(false);

        fetchAutoDetectData();
      }

      await AsyncStorage.setItem('isAutoDetectEnabled', JSON.stringify(!isAutoDetectEnabled));
      setAutoDetectEnabled(!isAutoDetectEnabled);
    } catch (error) {
      console.error('Error saving isAutoDetectEnabled state', error);
    }
  }

  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      console.warn('Unable to open settings');
    });
  };

  const handleAlwaysLocationPermissionChange = async () => {
    try {
      if (isAlwaysLocationPermissionEnabled) {
        openAppSettings();
      } else {
        setSlidebarSelected("locationNotAllowed");
        setSlidebarActive(true);
      }
      await AsyncStorage.setItem('isAlwaysLocationPermissionEnabled', JSON.stringify(!isAlwaysLocationPermissionEnabled));
      setAlwaysLocationPermissionEnabled(!isAlwaysLocationPermissionEnabled);
    } catch (error) {
      console.error('Error saving isAlwaysLocationPermissionEnabled state', error);
    }
  }

  const handleAutomaticLocationPermissionChange = async () => {
    try {
      await AsyncStorage.setItem('isAutomaticLocationPermissionEnabled', JSON.stringify(!isAutomaticLocationPermissionEnabled));
      setAutomaticLocationPermissionEnabled(!isAutomaticLocationPermissionEnabled);
    } catch (error) {
      console.error('Error saving isAutomaticLocationPermissionEnabled state', error);
    }
  }

  const handleCustomAdjustmentChange = async (prayer, increment) => {
    const newAdjustments = {
      ...customAdjustments,
      [prayer]: Math.max(-60, Math.min(60, customAdjustments[prayer] + increment))
    };
    setCustomAdjustments(newAdjustments);
    try {
      await AsyncStorage.setItem('customAdjustments', JSON.stringify(newAdjustments));
    } catch (error) {
      console.error('Error saving customAdjustments state', error);
    }
  };

  return (
    <ScrollView ref={scrollViewRef}>
      <View>
        <Text style={[{ color: Colors[theme].focusColor }, styles.textSelected]}>Settings</Text>
        <ThemedText style={styles.title}>Prayer Times</ThemedText>
        <ThemedText style={styles.subtitle}>Please select how you would like your prayer times to be calculated</ThemedText>
        
        <View style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}>
          <View style={styles.optionRow}>
            <ThemedText style={[styles.optionText, { opacity: opacityText }]}>12-hour Time</ThemedText>
            <Switch onPress={handlePrayerTimeFormatDisplaySettingChange} status={is12HourPrayerTimeFormatEnabled} />
          </View>
        </View>
        
        <StandarButton onPress={() => setMadhabOptionActive(!madhabOptionActive)} style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}>
          <View style={styles.optionRow}>
            <ThemedText style={[styles.optionText, { opacity: opacityText }]}>Madhab / Asr Time</ThemedText>
            <View style={styles.valueContainer}>
              <ThemedText style={[styles.valueText, { opacity: opacityText }]} numberOfLines={1} ellipsizeMode="tail">
                {madhab}
              </ThemedText>
            </View>
          </View>
        </StandarButton>
        
        <Animated.View style={[styles.locationCont, { maxHeight: animatedHeight, marginTop: animatedTop }]}>
          <StandarButton
            onPress={() => { handleMadhabChange('Earlier Asr'); setMadhabOptionActive(false) }}
            style={[styles.option, {
              backgroundColor: Colors[theme].opacityBtn,
              borderColor: madhab === 'Earlier Asr' ? Colors[theme].focusColor : Colors[theme].opacityBtn
            }]}
          >
            <ThemedText style={[styles.title, {
              color: madhab === 'Earlier Asr' ? Colors[theme].focusColor : Colors[theme].textColor,
              opacity: madhab === 'Earlier Asr' ? 1 : 0.5
            }]}>
              Earlier Asr Time
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Maliki, Shafi'i & Hanbali
            </ThemedText>
          </StandarButton>
          <StandarButton
            onPress={() => { handleMadhabChange('Later Asr'); setMadhabOptionActive(false) }}
            style={[styles.option, {
              backgroundColor: Colors[theme].opacityBtn,
              borderColor: madhab === 'Later Asr' ? Colors[theme].focusColor : Colors[theme].opacityBtn
            }]}
          >
            <ThemedText style={[styles.title, {
              color: madhab === 'Later Asr' ? Colors[theme].focusColor : Colors[theme].textColor,
              opacity: madhab === 'Later Asr' ? 1 : 0.5
            }]}>
              Later Asr Time
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Hanafi
            </ThemedText>
          </StandarButton>
        </Animated.View>
        
        <ThemedText style={styles.title2}>Prayer Calculation Method</ThemedText>
        <View style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}>
          <View style={styles.nestedContainer}>
            <View style={styles.optionRow}>
              <ThemedText style={[styles.optionText, { opacity: opacityText }]}>Autopilot</ThemedText>
              <Switch onPress={handleAutopilotChange} status={isAutopilotEnabled} />
            </View>
            <ThemedText style={[styles.description, { opacity: opacityDescription }]}>Ensure auto-detect & automatic locations are enabled allowing accurate prayer times using valid methodology for the country you are in.</ThemedText>
          </View>
          <View style={[styles.separator, { opacity: 0.4, backgroundColor: Colors[theme].textColor }]} />
          <View style={styles.nestedContainer}>
            <View style={styles.optionRow}>
              <ThemedText 
                style={[
                  styles.optionText, 
                  { opacity: !isAutopilotEnabled ? opacityText : opacityText - 0.3 }
                ]}
              >
                "Always" Location Permission
              </ThemedText>
              <Switch onPress={handleAlwaysLocationPermissionChange} disabled={isAutopilotEnabled} status={locationAllowed && isAlwaysLocationPermissionEnabled} />
            </View>
            <ThemedText style={[styles.description, { opacity: !isAutopilotEnabled ? opacityDescription : opacityDescription - 0.3 }]}>Allows background location updates to ensure accurate notification & widget prayer times. Change in Setting App</ThemedText>
          </View>
          <View style={styles.nestedContainer}>
            <View style={styles.optionRow}>
              <ThemedText 
                style={[
                  styles.optionText, 
                  { opacity: !isAutopilotEnabled ? opacityText : opacityText - 0.3 }
                ]}
              >
                Automatic Location Permission
              </ThemedText>
              <Switch onPress={handleAutomaticLocationPermissionChange} disabled={isAutopilotEnabled} status={isAutomaticLocationPermissionEnabled} />
            </View>
            <ThemedText style={[styles.description, { opacity: !isAutopilotEnabled ? opacityDescription : opacityDescription - 0.3 }]}>Ensure up-to-date location settings when opening the app</ThemedText>
          </View>
          <View style={styles.nestedContainer}>
            <View style={styles.optionRow}>
              <ThemedText 
                style={[
                  styles.optionText, 
                  { opacity: !isAutopilotEnabled ? opacityText : opacityText - 0.3 }
                ]}
              >
                Auto-Detect
              </ThemedText>
              <Switch onPress={handleAutoDetectChange} disabled={isAutopilotEnabled} status={isAutoDetectEnabled} />
            </View>
            <ThemedText style={[styles.description, { opacity: !isAutopilotEnabled ? opacityDescription : opacityDescription - 0.3 }]}>Automatically selects a valid calculation method when travelling (supported countries)</ThemedText>
            <FormattedText style={[styles.subhead, { opacity: .7 }]}>{autoDetectMessage()}</FormattedText>
          </View>
        </View>

        <StandarButton 
          onPress={() => !isAutoDetectEnabled && setCalculationMethodModalVisible(true)}
          style={[styles.optionCont, { opacity: isAutoDetectEnabled ? .4 : 1, backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}
        >
          <View style={styles.optionRow}>
            <ThemedText style={[styles.optionText, { opacity: opacityText }]}>Calculation Method</ThemedText>
            <View style={styles.valueContainer}>
              <ThemedText style={[styles.valueText, { opacity: opacityText }]} numberOfLines={2} ellipsizeMode="tail">
                {calculationMethods[selectedCalculationMethod].name}
              </ThemedText>
            </View>
          </View>
        </StandarButton>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isCalculationMethodModalVisible}
          onRequestClose={() => setCalculationMethodModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: Colors[theme].background }]}>
              <ThemedText style={styles.modalTitle}>Calculation Method</ThemedText>
              <FlatList
                data={calculationMethods}
                renderItem={renderCalculationMethodItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.calculationMethodList}
              />
            </View>
          </View>
        </Modal>
        
        <StandarButton onPress={() => setHighAltitudeOptionActive(!highAltitudeOptionActive)} style={[styles.optionCont, { opacity: isAutoDetectEnabled ? .4 : 1, backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}>
          <View style={styles.optionRow}>
            <ThemedText style={[styles.optionText, { opacity: opacityText }]}>High Altitude Method</ThemedText>
            <View style={styles.valueContainer}>
              <ThemedText style={[styles.valueText, { opacity: opacityText }]} numberOfLines={1} ellipsizeMode="tail">
                {highAltitudeMethods[highAltitudeMethod - 1].name}
              </ThemedText>
            </View>
          </View>
        </StandarButton>
        
        <Animated.View style={[styles.locationCont, { maxHeight: animatedHighAltitudeHeight, marginTop: animatedHighAltitudeTop }]}>
          {highAltitudeMethods.map((method) => (
            <StandarButton
              key={method.id}
              onPress={() => handleHighAltitudeMethodChange(method.id)}
              style={[styles.option, {
                backgroundColor: Colors[theme].opacityBtn,
                borderColor: highAltitudeMethod === method.id ? Colors[theme].focusColor : Colors[theme].opacityBtn,
                width: '32%'
              }]}
            >
              <ThemedText style={[styles.title, {
                color: highAltitudeMethod === method.id ? Colors[theme].focusColor : Colors[theme].textColor,
                opacity: highAltitudeMethod === method.id ? 1 : 0.5,
                fontSize: 12,
                textAlign: 'center'
              }]}>
                {method.name}
              </ThemedText>
            </StandarButton>
          ))}
        </Animated.View>
        
        <StandarButton 
          onPress={onCustomAnglesPressed}
          style={[styles.optionCont, { opacity: isAutoDetectEnabled ? .4 : 1, backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}
        >
          <View style={styles.optionRow}>
            <ThemedText style={[styles.optionText, { opacity: opacityText }]}>Custom Angles</ThemedText>
            <View style={styles.valueContainer}>
              <ThemedText style={[styles.valueText, { opacity: opacityText }]} numberOfLines={1} ellipsizeMode="tail">
                {`(${customAngles.Fajr.toFixed(1)}, ${customAngles.Isha.toFixed(1)})`}
              </ThemedText>
            </View>
          </View>
        </StandarButton>
        
        <Animated.View style={[styles.adjustmentsCont, { maxHeight: animatedAnglesHeight }]}>
          <View style={[styles.adjustmentsInnerCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}>
            {Object.keys(customAngles).map((angle) => (
              <View key={angle} style={styles.adjustmentRow}>
                <ThemedText style={styles.adjustmentLabel}>{`${angle} Angle`}</ThemedText>
                <View style={styles.adjustmentControls}>
                  <TouchableOpacity
                    onPress={() => handleCustomAngleChange(angle, -0.5)}
                    style={[styles.adjustmentButton, { backgroundColor: Colors[theme].background }]}
                  >
                    <ThemedText style={styles.adjustmentButtonText}>-</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.adjustmentValue}>{customAngles[angle].toFixed(1)}°</ThemedText>
                  <TouchableOpacity
                    onPress={() => handleCustomAngleChange(angle, 0.5)}
                    style={[styles.adjustmentButton, { backgroundColor: Colors[theme].background }]}
                  >
                    <ThemedText style={styles.adjustmentButtonText}>+</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
        
        <StandarButton 
          onPress={onCustomAdjustmentsPressed}
          style={[styles.optionCont, { opacity: isAutoDetectEnabled ? .4 : 1, backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}
        >
          <View style={styles.optionRow}>
            <ThemedText style={[styles.optionText, { opacity: opacityText }]}>Custom Adjustments</ThemedText>
            <View style={styles.valueContainer}>
              <ThemedText style={[styles.valueText, { opacity: opacityText }]} numberOfLines={2} ellipsizeMode="tail">
                {`${customAdjustments.Fajr}, ${customAdjustments.Sunrise}, ${customAdjustments.Dhuhr}, ${customAdjustments.Asr}, ${customAdjustments.Maghrib}, ${customAdjustments.Isha}`}
              </ThemedText>
            </View>
          </View>
        </StandarButton>
        
        <Animated.View style={[styles.adjustmentsCont, { maxHeight: animatedAdjustmentsHeight }]}>
          <View style={[styles.adjustmentsInnerCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}>
            {Object.keys(customAdjustments).map((prayer) => (
              <View key={prayer} style={styles.adjustmentRow}>
                <ThemedText style={styles.adjustmentLabel}>{prayer}</ThemedText>
                <View style={styles.adjustmentControls}>
                  <TouchableOpacity
                    onPress={() => handleCustomAdjustmentChange(prayer, -1)}
                    style={[styles.adjustmentButton, { backgroundColor: Colors[theme].background }]}
                  >
                    <ThemedText style={styles.adjustmentButtonText}>-</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.adjustmentValue}>{customAdjustments[prayer]}</ThemedText>
                  <TouchableOpacity
                    onPress={() => handleCustomAdjustmentChange(prayer, 1)}
                    style={[styles.adjustmentButton, { backgroundColor: Colors[theme].background }]}
                  >
                    <ThemedText style={styles.adjustmentButtonText}>+</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  textSelected: {
    fontSize: 12,
    fontWeight: '500'
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 16,
    alignItems: 'center',
  },
  title2: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 16,
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
  description: {
    fontSize: 12,
    fontWeight: '400',
    opacity: .6,
    marginTop: 0,
    marginRight: 48
  },
  subhead: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 16,
    marginRight: 48
  },
  optionCont: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    borderWidth: 2,
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nestedContainer: {
    width: '100%',
    marginBottom: 16,
  },
  locationCont: {
    overflow: 'hidden',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
  option: {
    width: '47%',
    height: 96,
    borderRadius: 8,
    padding: 7,
    marginTop: 8,
    borderWidth: 2,
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    width: '100%',
    marginBottom: 16,
  },
  adjustmentsCont: {
    overflow: 'hidden',
    width: '100%',
    marginTop: 8,
  },
  adjustmentsInnerCont: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
  },
  adjustmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adjustmentLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  adjustmentControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adjustmentButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  adjustmentButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  adjustmentValue: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'left',
  },
  calculationMethodList: {
    flexGrow: 0,
  },
  calculationMethodItem: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    justifyContent: 'center',
  },
  calculationMethodText: {
    fontSize: 14,
    fontWeight: '500',
  },
});