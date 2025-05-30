import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import * as Location from 'expo-location';
import { QiblaDirection, TimingData } from "../config/httprouter";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GregorianDates } from '../config/httprouter';
import { timings } from "../config/offset";
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from "expo-router";
import { PushNotificationFunction } from "../components/services/PushNotifications";

import { magvar } from 'magvar';
import LocationService from '../components/services/LocationService';
import { CategoryData, MadhabCategoryData, AdhanSoundData, fetchCategories, fetchMadhabCategories, fetchAdhanSounds } from '../components/services/FirebaseService';

// Define la interfaz para el contexto global
interface GlobalContextProps {
  categories: CategoryData[];
  madhabCategories: MadhabCategoryData[];
  adhanSounds: AdhanSoundData[];
  twoWeeksTimingData: {};
  slidebarActive: boolean;
  setSlidebarActive: (value: boolean) => void;
  useSlidebar: () => void;
  changeNotificationConfig: () => void;
  checkLocationPermission: () => void;
  slidebarSelected: string;
  setSlidebarSelected: (value: string) => void;
  changeFeedbackConfig: () => void;
  hapticFeedback: boolean;
  setHapticFeedback: (value: boolean) => void;
  setLocationAllowed: (value: boolean) => void;
  onBoardingBtnText: string;
  setOnBoardingBtnText: (value: string) => void;
  onBoardingBtnDisabled: boolean;
  setOnBoardingBtnDisabled: (value: boolean) => void;
  city: string;
  country: string;
  latitude: number;
  setDateSelected: Array;
  longitude: number;
  qiblaDirection: number;
  declination: number;
  dateSelected: number;
  notification: boolean;
  locationAllowed: boolean;
  notificationStatus: {};
  setNotification: (value: string) => void;
  AsrTime: string;
  setAsrTime: (value: string) => void;
  is12HourPrayerTimeFormatEnabled: string;
  set12HourPrayerTimeFormatEnabled: (value: string) => void;
  timingSelected: {};
  setTimingSelected: (value: string) => void;
  changeNotificationStatus: (name: string, value: string, adhan: string) => void;
  updateQiblaPosition: () => Promise<void>;
  handleMadhabChange: (value: string) => void;
  setupPushNotification: (status: {}) => void;
  madhab: string;
  calculationMethod: {};
  isAutopilotEnabled: boolean;
  setAutopilotEnabled: (value: boolean) => void;
  isAlwaysLocationPermissionEnabled: boolean;
  setAlwaysLocationPermissionEnabled: (value: boolean) => void;
  isAutomaticLocationPermissionEnabled: boolean;
  setAutomaticLocationPermissionEnabled: (value: boolean) => void;
  isAutoDetectEnabled: boolean;
  setAutoDetectEnabled: (value: boolean) => void;
  customAdjustments: any;
  setCustomAdjustments: (value: any) => void;
  customAngles: any;
  setCustomAngles: (value: any) => void;
  selectedCalculationMethod: number;
  setSelectedCalculationMethod: (value: number) => void;
  highAltitudeMethod: number;
  setHighAltitudeMethod: (value: number) => void;
  settingLastUpdate: number;
  setSettingLastUpdate: (value: number) => void;
  setCalculationMethod: ({ }) => void;
}

// Crear el contexto global con un valor inicial indefinido
const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

// Hook para acceder al contexto
export const useGlobalContext = (): GlobalContextProps => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

// Tipar las props del GlobalProvider
interface GlobalProviderProps {
  children: ReactNode;
}

const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [madhabCategories, setMadhabCategories] = useState<MadhabCategoryData[]>([]);
  const [adhanSounds, setAdhanSounds] = useState<AdhanSoundData[]>([]);
  const [twoWeeksCalendarData, setTwoWeeksCalendarData] = useState(null);
  const [twoWeeksPrayerData, setTwoWeeksPrayerData] = useState(null);
  const [twoWeeksTimingData, setTwoWeeksTimingData] = useState(null);
  const [is12HourPrayerTimeFormatEnabled, set12HourPrayerTimeFormatEnabled] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [settingLastUpdate, setSettingLastUpdate] = useState(0);

  const [slidebarActive, setSlidebarActive] = useState(false);
  const [slidebarSelected, setSlidebarSelected] = useState('');
  const [hapticFeedback, setHapticFeedback] = useState(false);
  const [onBoardingBtnText, setOnBoardingBtnText] = useState('Next');
  const [onBoardingBtnDisabled, setOnBoardingBtnDisabled] = useState(false);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [declination, setDeclination] = useState(0);
  const [notification, setNotification] = useState(true);
  const [AsrTime, setAsrTime] = useState('');

  const [timingSelected, setTimingSelected] = useState({});
  const [dateSelected, setDateSelected] = useState('');
  const [indexDateSelected, setIndexDateSelected] = useState(7);
  const [dateActive, setDateActive] = useState('');
  const [madhab, setMadhab] = useState();
  const [nextPrayer, setNextPrayer] = useState(null);
  const [nextPrayerName, setNextPrayerName] = useState('');

  const [calculationMethod, setCalculationMethod] = useState({});
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [allDates, setAllDates] = useState([]);

  const [isAutopilotEnabled, setAutopilotEnabled] = useState(false);
  const [isAlwaysLocationPermissionEnabled, setAlwaysLocationPermissionEnabled] = useState(false);
  const [isAutomaticLocationPermissionEnabled, setAutomaticLocationPermissionEnabled] = useState(false);
  const [isAutoDetectEnabled, setAutoDetectEnabled] = useState(false);
  const [customAdjustments, setCustomAdjustments] = useState({
    Fajr: 0,
    Sunrise: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0
  });
  const [customAngles, setCustomAngles] = useState({
    Fajr: 15.0,
    Isha: 15.0
  });
  const [selectedCalculationMethod, setSelectedCalculationMethod] = useState(15);
  const [highAltitudeMethod, setHighAltitudeMethod] = useState(1);

  const [timeRemaining, setTimeRemaining] = useState('--:--:--');

  const initialNotificationStatus = {
    Fajr: { status: 'active', timing: '15', adhan: 'Mishari.wav' },
    Sunrise: { status: 'active', timing: '15', adhan: 'Mishari.wav' },
    Dhuhr: { status: 'active', timing: '15', adhan: 'Mishari.wav' },
    Asr: { status: 'active', timing: '15', adhan: 'Mishari.wav' },
    Maghrib: { status: 'active', timing: '15', adhan: 'Mishari.wav' },
    Isha: { status: 'active', timing: '15', adhan: 'Mishari.wav' },
  };
  const [notificationStatus, setNotificationStatus] = useState(initialNotificationStatus);

  const router = useRouter();

  useEffect(() => {
    const checkFirstTime = async () => {
      const firstTimeString = await AsyncStorage.getItem('isFirstTime');
      const firstTime = firstTimeString === 'true' ? true : firstTimeString === 'false' ? false : true;
      if (firstTime === true) {
        await AsyncStorage.setItem('isFirstTime', 'true');
        setIsFirstTime(true);
      } else {
        setIsFirstTime(false);
      }
    };

    // // // console.log('checkFirstTime -- isFirstTime', isFirstTime);
    checkFirstTime();
  }, []);
  const changeNotificationStatus = (name, status, adhan) => {
    setNotificationStatus(prev => {
      const newStatus = {
        ...prev,
        [name]: {
          ...prev[name],
          status: status,
          timing: prev[name].timing ? prev[name].timing : 0,
          adhan: adhan,
        }
      };
      saveNotificationStatus(newStatus);
      setupPushNotification(newStatus);
      return newStatus;
    });
  };

  const loadNotificationStatus = async () => {
    try {
      const savedNotificationStatus = await AsyncStorage.getItem('NotificationStatus');
      if (savedNotificationStatus !== null) {
        setNotificationStatus(JSON.parse(savedNotificationStatus)); // Convierte la cadena a su valor original
      }
    } catch (error) {
      console.error('Error loading notification status:', error);
    }
  };
  const saveNotificationStatus = async (newStatus) => {
    try {
      await AsyncStorage.setItem('NotificationStatus', JSON.stringify(newStatus));
    } catch (error) {
      console.error('Error saving notification status:', error);
    }
  };
  useEffect(() => {
    const hideSplash = async () => {
      try {
        if (isFirstTime === true) {
          router.replace('/(auth)/');
        } else {
          router.replace('/(tabs)/');
        }
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    if (isFirstTime !== null) {
      hideSplash();
    }
    // // // console.log('hideSplash -- isFirstTime', isFirstTime);
  }, [isFirstTime]);

  const useSlidebar = () => {
    if (locationAllowed) {
      setSlidebarActive(!slidebarActive);
    } else {
      setSlidebarActive(true);
      setSlidebarSelected('locationNotAllowed');
    }
  };

  const loadHapticFeedbackConfig = async () => {
    try {
      const hapticFeedback = await AsyncStorage.getItem('hapticFeedback');
      if (hapticFeedback !== null) {
        setHapticFeedback(JSON.parse(hapticFeedback))
      } else {
        await AsyncStorage.setItem('hapticFeedback', JSON.stringify(true));
        setHapticFeedback(true)
      }
    } catch (error) {
      console.error("Error loading Madhab state", error);
    }
  };
  const loadMadhabChange = async () => {
    try {
      const madhabChange = await AsyncStorage.getItem('AsrTime');
      if (madhabChange !== null) {
        setMadhab(madhabChange.replace(/^"|"$/g, ''))
      } else {
        await AsyncStorage.setItem('AsrTime', 'Earlier Asr');
        setHapticFeedback(true)
      }
    } catch (error) {
      console.error("Error loading Madhab state", error);
    }
  };
  const handleMadhabChange = async (madhabValue) => {
    setMadhab(madhabValue);
    if (madhabValue) await AsyncStorage.setItem('madhab', JSON.stringify(madhabValue));
    await AsyncStorage.setItem('AsrTime', JSON.stringify(madhabValue));
  };

  const changeFeedbackConfig = async () => {
    await AsyncStorage.setItem('hapticFeedback', JSON.stringify(!hapticFeedback));
    setHapticFeedback(!hapticFeedback)
  }
  const loadNotificationsConfig = async () => {
    try {
      const hapticFeedback = await AsyncStorage.getItem('notifications');
      if (hapticFeedback !== null) {
        setNotification(JSON.parse(hapticFeedback))
      } else {
        await AsyncStorage.setItem('notifications', JSON.stringify(true));
        setNotification(true)
      }
    } catch (error) {
      setNotification(initialNotificationStatus)
    }
  };
  const changeNotificationConfig = async () => {
    await AsyncStorage.setItem('notifications', JSON.stringify(!notification));
    setNotification(!notification)
  }

  const loadConfig = async () => {
    try {
      const time = await AsyncStorage.getItem('is12HourPrayerTimeFormatEnabled');
      if (time !== null) {
        set12HourPrayerTimeFormatEnabled(time)
      } else {
        set12HourPrayerTimeFormatEnabled('true');
      }

      const isAutoDetectEnabledValue = await AsyncStorage.getItem('isAutoDetectEnabled');
      if (isAutoDetectEnabledValue !== null) {
        setAutoDetectEnabled(JSON.parse(isAutoDetectEnabledValue));
      } else {
        setAutoDetectEnabled(true);
      }

      const isAutopilotEnabled = await AsyncStorage.getItem('isAutopilotEnabled');
      if (isAutopilotEnabled !== null) {
        setAutopilotEnabled(JSON.parse(isAutopilotEnabled));
      } else {
        setAutopilotEnabled(true);
      }

      const isAutomaticLocationPermissionEnabled = await AsyncStorage.getItem('isAutomaticLocationPermissionEnabled');
      if (isAutomaticLocationPermissionEnabled !== null) {
        setAutomaticLocationPermissionEnabled(JSON.parse(isAutomaticLocationPermissionEnabled));
      } else {
        setAutomaticLocationPermissionEnabled(true);
      }

      if (isAutomaticLocationPermissionEnabled) {
        LocationService.getUpdatedLocation();
      }

      const isAlwaysLocationPermissionEnabled = await AsyncStorage.getItem('isAlwaysLocationPermissionEnabled');
      if (isAlwaysLocationPermissionEnabled !== null) {
        setAlwaysLocationPermissionEnabled(JSON.parse(isAlwaysLocationPermissionEnabled));
      } else {
        setAlwaysLocationPermissionEnabled(true);
      }

      const customAnglesValue = await AsyncStorage.getItem('customAngles');
      if (customAnglesValue !== null) {
        setCustomAngles(JSON.parse(customAnglesValue));
      }

      const customAdjustmentsValue = await AsyncStorage.getItem('customAdjustments');
      if (customAdjustmentsValue !== null) {
        setCustomAdjustments(JSON.parse(customAdjustmentsValue));
      }

      const selectedCalculationMethodValue = await AsyncStorage.getItem('selectedCalculationMethod');
      if (selectedCalculationMethodValue !== null) {
        setSelectedCalculationMethod(Number(selectedCalculationMethodValue));
      }

      const highAltitudeMethodValue = await AsyncStorage.getItem('highAltitudeMethod');
      if (highAltitudeMethodValue !== null) {
        setHighAltitudeMethod(Number(highAltitudeMethodValue));
      }

      setSettingLastUpdate(Date.now());
    } catch (error) {
      console.error("Error loading config state", error);
    }
  };

  const updateQiblaPosition = async () => {
    try {
      const qiblaResponse = await QiblaDirection(latitude, longitude);
      const qiblaDir = qiblaResponse.data.data.direction;
      setQiblaDirection(qiblaDir);

      // Calculate magnetic declination using World Magnetic Model 2025-2030
      const declination = magvar(latitude, longitude);
      setDeclination(declination);
    } catch (error) {
      console.error("Error fetching Qibla direction:", error);
    }
  };

  const formatPrayerDateString = useCallback((date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const generateTwoWeeksPrayerDates = useCallback(() => {
    const currentDate = new Date();
    const today = currentDate.getDate();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const generatedDates = Array.from({ length: 15 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(today + i - 7);
      const formattedDate = formatPrayerDateString(date);

      return {
        first: daysOfWeek[date.getDay()],
        second: date.getDate().toString(),
        third: (date.getDate() + 1).toString(),
        fullDate: formattedDate
      };
    });

    setAllDates(generatedDates);
    setIndexDateSelected(7);
    const todayFormatted = formatPrayerDateString(currentDate);
    setDateSelected(todayFormatted);
    setDateActive(todayFormatted);

  }, [formatPrayerDateString]);

  const fetchTwoWeeksPrayerTimings = useCallback(async (): Promise<void> => {
    try {
      const locationData = await LocationService.getLocation();
      const { latitude, longitude, city, country } = locationData;

      if (!latitude || !longitude || !city || !country) {
        // // console.log('Data location not yet, skipping fetchTwoWeeksPrayerTimings');
        return;
      }

      setLatitude(latitude);
      setLongitude(longitude);
      setCountry(country);
      setCity(city);

      console.log('Fetching prayer timings for city:', city, '| country:', country, '| latitude:', latitude, '| longitude:', longitude);

      const today = new Date();
      const dates = Array.from({ length: 15 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i - 7);
        return formatPrayerDateString(date);
      });

      const [prayerResponses, calendarResponses] = await Promise.all([
        Promise.all(dates.map(formattedDate =>
          TimingData(formattedDate, latitude, longitude, madhab, country, isAutoDetectEnabled, selectedCalculationMethod, highAltitudeMethod, customAdjustments)
        )),
        Promise.all(dates.map(formattedDate =>
          GregorianDates(formattedDate)
        ))
      ]);

      const prayerData = Object.fromEntries(dates.map((formattedDate, i) => [
        formattedDate,
        {
          timings: prayerResponses[i].data.data.timings,
          offset: prayerResponses[i].data.data.meta.offset,
          method: prayerResponses[i].data.data.meta.method,
          highAltitudeMethod: prayerResponses[i].data.data.meta.latitudeAdjustmentMethod
        }
      ]));
      setTwoWeeksPrayerData(prayerData);

      const formattedToday = formatPrayerDateString(today)
      setCalculationMethod(prayerData[formattedToday].method);

      if (isAutoDetectEnabled) {
        setSelectedCalculationMethod(prayerData[formattedToday].method.id);
        await AsyncStorage.setItem('selectedCalculationMethod', JSON.stringify(prayerData[formattedToday].method.id));

        const altitudeMethod = prayerData[formattedToday].highAltitudeMethod;
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

        const calculationId = country == 'United Kingdom' ? 15 : prayerData[formattedToday].method.id; // Add UK-specific method
        // console.log(`calculationId: ${calculationId}`);
        // console.log(`timings[calculationId]: ${JSON.stringify(timings[calculationId])}`);
        setCustomAngles({
          Fajr: timings[calculationId].Fajr.angle,
          Isha: timings[calculationId].Isha.angle
        })
        setCustomAdjustments({
          Fajr: timings[calculationId].Fajr.minutes,
          Sunrise: timings[calculationId].Sunrise.minutes,
          Dhuhr: timings[calculationId].Dhuhr.minutes,
          Asr: timings[calculationId].Asr.minutes,
          Maghrib: timings[calculationId].Maghrib.minutes,
          Isha: timings[calculationId].Isha.minutes
        });
      }

      const calendarData = Object.fromEntries(dates.map((formattedDate, i) => [
        formattedDate,
        calendarResponses[i].data.data
      ]));
      setTwoWeeksCalendarData(calendarData);

      const timingData = Object.fromEntries(dates.map((formattedDate, i) => [
        formattedDate,
        transformTimeOption(
          is12HourPrayerTimeFormatEnabled,
          prayerResponses[i].data.data.timings,
          prayerResponses[i].data.data.meta.offset,
          timings,
          prayerResponses[i].data.data.meta.method,
          formattedDate,
          i
        )
      ]));
      setTwoWeeksTimingData(timingData);

    } catch (error) {
      console.error(`${new Date().toISOString()} fetchTwoWeeksPrayerTimings: Error`, error);
    }
  }, [formatPrayerDateString, madhab, calculationMethod, settingLastUpdate]);

  const initializeData = useCallback(async () => {
    // console.log('initializeData WANT TO START');
    if (locationAllowed && madhab && dateActive && settingLastUpdate > 0) {
      // console.log('initializeData ENTER');
      await fetchTwoWeeksPrayerTimings();
      // console.log('initializeData DONE');
      setIsInitialized(true);
    }
  }, [locationAllowed, madhab, dateActive, settingLastUpdate, generateTwoWeeksPrayerDates, fetchTwoWeeksPrayerTimings]);

  useEffect(() => {
    generateTwoWeeksPrayerDates();
    initializeData();
    // console.log('initializeData -- ');
  }, [locationAllowed, madhab, dateActive, settingLastUpdate]);

  // Run location check immediately during initialization
  useEffect(() => {
    checkLocationPermission();

    // Set up location change callback
    LocationService.setLocationChangeCallback((newLocation) => {
      if (newLocation) {
        setLatitude(newLocation.latitude);
        setLongitude(newLocation.longitude);
        setCity(newLocation.city);
        setCountry(newLocation.country);

        // Trigger prayer times update
        fetchTwoWeeksPrayerTimings();
        // Update settingLastUpdate to trigger UI refresh

        setSettingLastUpdate(Date.now());
      }
    });
  }, []);

  const setupPushNotification = (newStatus: {}) => {
    if (isInitialized && twoWeeksTimingData && dateActive && city && newStatus) {
      try {
        PushNotificationFunction(notification, twoWeeksTimingData, city, newStatus);
      } catch (error) {
        console.error("Error in PushNotificationFunction:", error);
        // Handle the error appropriately
      }
    }
  }

  useEffect(() => {
    setupPushNotification(notificationStatus);
  }, [isInitialized, dateActive, madhab, notification, settingLastUpdate]);

  useEffect(() => {
    findNextPrayer();
    // // // console.log('findNextPrayer -- ');
  }, [nextPrayer, nextPrayerName, initializeData, madhab, twoWeeksTimingData, settingLastUpdate]);

  const transformTimeOption = (is12Hour, timeOption, customMinutes, timings, calculationMethod, dateSelected, indexDateSelected) => {
    const prayersToInclude = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let previousHours = -1;
    let dayOffset = 0;

    const data = Object.fromEntries(
      Object.entries(timeOption)
        .filter(([prayer]) => prayersToInclude.includes(prayer)) // Filtrar oraciones a incluir
        .map(([prayer, time]) => {
          const [hours, minutes] = time.split(':').map(Number);
          const additionalMinutes = Number(customMinutes[prayer] || 0);
          const calculationId = country == 'United Kingdom' ? 15 : calculationMethod.id; // Add UK-specific method
          const timingValue = timings[calculationId]?.[prayer].minutes;
          const timingAdjustment = Number(timingValue || 0);

          let customAdjustment = timingAdjustment;
          if (!isAutoDetectEnabled) {
            if (prayer === 'Fajr') {
              customAdjustment = customAdjustments.Fajr;
            } else if (prayer === 'Sunrise') {
              customAdjustment = customAdjustments.Sunrise;
            } else if (prayer === 'Dhuhr') {
              customAdjustment = customAdjustments.Dhuhr;
            } else if (prayer === 'Asr') {
              customAdjustment = customAdjustments.Asr;
            } else if (prayer === 'Maghrib') {
              customAdjustment = customAdjustments.Maghrib;
            } else if (prayer === 'Isha') {
              customAdjustment = customAdjustments.Isha;
            }
          }

          // Calculate the timestamp
          // Check if we've crossed to a new day
          if (hours < previousHours) {
            dayOffset++;
          }
          previousHours = hours;

          // Calculate the timestamp
          const [day, month, year] = dateSelected.split('-').map(Number);
          const timestamp = new Date(year, month - 1, day);  // month is 0-indexed in JS Date

          timestamp.setDate(timestamp.getDate() + dayOffset);
          timestamp.setHours(hours, minutes + additionalMinutes + customAdjustment, 0, 0);

          // Calculate formatted time string
          const formattedTime = timestamp.toLocaleTimeString('en-US', {
            hour: is12Hour ? 'numeric' : '2-digit',
            minute: '2-digit',
            hourCycle: is12Hour ? 'h12' : 'h23'
          });

          // // // console.log('prayer', prayer, 'time', time, 'hours', hours, 'minutes', minutes, 'additionalMinutes', additionalMinutes, 'timingValue', timingValue, 'timingAdjustment', timingAdjustment);
          // // // console.log('timestamp', timestamp, 'formattedTime', formattedTime);

          let prayerNotificationStatus = {};
          if (prayer === 'Fajr') {
            prayerNotificationStatus = notificationStatus.Fajr;
          } else if (prayer === 'Sunrise') {
            prayerNotificationStatus = notificationStatus.Sunrise;
          } else if (prayer === 'Dhuhr') {
            prayerNotificationStatus = notificationStatus.Dhuhr;
          } else if (prayer === 'Asr') {
            prayerNotificationStatus = notificationStatus.Asr;
          } else if (prayer === 'Maghrib') {
            prayerNotificationStatus = notificationStatus.Maghrib;
          } else if (prayer === 'Isha') {
            prayerNotificationStatus = notificationStatus.Isha;
          }

          const result = [
            prayer,
            {
              time: formattedTime,
              notificationStatus: prayerNotificationStatus,
              name: prayer,
              date: dateSelected,
              index: indexDateSelected,
              timestamp: timestamp.getTime()
            },
          ];

          return result;
        })
    );

    return data;
  };

  const findNextPrayer = () => {
    if (!twoWeeksTimingData) {
      // // // // console.log('Skip findNextPrayer');
      return;
    }

    const todayDate = new Date();
    const nowTimestamp = todayDate.getTime();
    const snoozeTime = 1000 * 30 * 60 // snooze for 30 mins

    // Find the next prayer for today
    const todayDateString = formatPrayerDateString(todayDate);
    const todayTimingData = twoWeeksTimingData[todayDateString];
    const todaysPrayer = Object.values(todayTimingData).find(prayer => nowTimestamp <= (prayer.timestamp + snoozeTime));

    if (todaysPrayer) {
      setNextPrayer(todaysPrayer);
      setNextPrayerName(todaysPrayer.name);
      return;
    }

    // If not found, look for tomorrow's prayers
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowDateString = formatPrayerDateString(tomorrowDate);
    const tomorrowTimingData = twoWeeksTimingData[tomorrowDateString];

    if (tomorrowTimingData) {
      const tomorrowPrayer = Object.values(tomorrowTimingData).find(prayer => true); // Get the first prayer of tomorrow
      if (tomorrowPrayer) {
        setNextPrayer(tomorrowPrayer);
        setNextPrayerName(tomorrowPrayer.name);
        return;
      }
    }

    console.error('No next prayer found for today or tomorrow');
    // Handle the case when no prayer is found for today or tomorrow
  };

  const formatTime = useCallback((hours, minutes, seconds) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Memoize updateTimeRemaining so its reference is stable unless nextPrayer, nextPrayerName, formatTime, or findNextPrayer changes
  const updateTimeRemaining = useCallback(() => {
    if (!nextPrayer) {
      setTimeRemaining('--:--:--');
      findNextPrayer();
      return;
    }

    const date = new Date();
    const now = date.getTime();
    let timeDiffMs = nextPrayer.timestamp - now;
    const snoozeTime = 30 * 60 * 1000; // 30 minutes in milliseconds

    if (timeDiffMs <= 0) {
      if (timeDiffMs + snoozeTime >= 0) {
        setTimeRemaining('Now');
      } else {
        findNextPrayer();
      }
      return;
    }

    const hours = Math.floor(timeDiffMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiffMs % (1000 * 60)) / 1000);

    const todayFormatted = formatPrayerDateString(date);
    if (dateActive !== todayFormatted) {
      setDateActive(todayFormatted);
    }

    setTimeRemaining(`${formatTime(hours, minutes, seconds)} until ${nextPrayerName}`);
  }, [nextPrayer, nextPrayerName, formatTime, findNextPrayer]);


  useEffect(() => {
    let intervalId;

    if (nextPrayer) {
      updateTimeRemaining(); // Initial update
      intervalId = setInterval(updateTimeRemaining, 1000); // Use 1000ms (1s) instead of 100ms to reduce render frequency
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // Only depend on nextPrayer, not updateTimeRemaining, to avoid interval recreation on every render
    // updateTimeRemaining is already memoized with nextPrayer and others
  }, [nextPrayer]);


  const checkLocationPermission = async () => {
    try {
      console.log('Checking location permission status...');
      // Get the current permission status without requesting it
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log('Current foreground permission status:', status);

      if (status === 'granted') {
        if (!locationAllowed) {
          console.log('Setting locationAllowed to true');
          setLocationAllowed(true);

          // Explicitly trigger a location update when permissions are granted
          try {
            console.log('Triggering location update via LocationService');
            const locationData = await LocationService.getUpdatedLocation();
            console.log('Location update successful:', locationData);

            // Update state with the new location data
            if (locationData) {
              setLatitude(locationData.latitude);
              setLongitude(locationData.longitude);
              setCity(locationData.city);
              setCountry(locationData.country);
            }
          } catch (locationError) {
            console.error('Failed to update location:', locationError);
          }
        }
      } else {
        console.log('Location permission not granted, showing permission request');
        setSlidebarSelected('locationNotAllowed');
        setSlidebarActive(true);
      }
    } catch (error) {
      console.error('Error checking location permission status:', error);
      setSlidebarSelected('locationNotAllowed');
    }
  };

  const loadDuaCategories = async () => {
    const result = await fetchCategories(setCategories);
    if (result.error) {
      console.error('Error fetching categories:', result.error);
    }
  };

  const loadMadhabCategories = async () => {
    const result = await fetchMadhabCategories(setMadhabCategories);
    if (result.error) {
      console.error('Error fetching Madhab categories:', result.error);
    }
  }

  const loadAdhanSounds = async () => {
    const result = await fetchAdhanSounds(setAdhanSounds);
    if (result.error) {
      console.error('Error fetching Adhan sounds:', result.error);
    }
  }

  useEffect(() => {
    loadDuaCategories();
    loadMadhabCategories();
    loadAdhanSounds();

    loadNotificationStatus();
    loadHapticFeedbackConfig();
    loadMadhabChange();
    loadNotificationsConfig();
    updateQiblaPosition();
    loadConfig();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        updateQiblaPosition,
        slidebarActive,
        setSlidebarActive,
        useSlidebar,
        setSlidebarSelected,
        slidebarSelected,
        setOnBoardingBtnText,
        onBoardingBtnText,
        setOnBoardingBtnDisabled,
        onBoardingBtnDisabled,
        changeFeedbackConfig,
        hapticFeedback,
        notification,
        transformTimeOption,
        AsrTime,
        setAsrTime,
        is12HourPrayerTimeFormatEnabled,
        set12HourPrayerTimeFormatEnabled,
        declination,
        qiblaDirection,
        city,
        latitude,
        longitude,
        changeNotificationConfig,
        setTimingSelected,
        timingSelected,
        setDateSelected,
        dateSelected,
        setDateActive,
        dateActive,
        handleMadhabChange,
        madhab,
        setNextPrayer,
        nextPrayer,
        timeRemaining,
        checkLocationPermission,
        calculationMethod,
        locationAllowed,
        setLocationAllowed,
        setIndexDateSelected,
        indexDateSelected,
        nextPrayerName,
        allDates,
        setAllDates,
        notificationStatus,
        setNotificationStatus,
        changeNotificationStatus,
        saveNotificationStatus,
        isInitialized,
        initializeData,
        twoWeeksTimingData,
        twoWeeksCalendarData,
        country,
        setupPushNotification,

        isAutopilotEnabled,
        setAutopilotEnabled,
        isAlwaysLocationPermissionEnabled,
        setAlwaysLocationPermissionEnabled,
        isAutomaticLocationPermissionEnabled,
        setAutomaticLocationPermissionEnabled,
        isAutoDetectEnabled,
        setAutoDetectEnabled,
        customAdjustments,
        setCustomAdjustments,
        customAngles,
        setCustomAngles,
        selectedCalculationMethod,
        setSelectedCalculationMethod,
        highAltitudeMethod,
        setHighAltitudeMethod,
        setSettingLastUpdate,
        setCalculationMethod,

        categories,
        madhabCategories,
        adhanSounds
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
