import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, SafeAreaView, FlatList, ScrollView, Text, Dimensions } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import TimmingIconSvg from '../../assets/svg/TimmingIconSvg';
import SadiqabadSvg from '../../assets/svg/SadiqabadSvg';
import TimingOption from '../../components/timingOption';
import IndexDecoration from '../../components/IndexDecoration';
import DateScroll from '../../components/DateScroll';
import { useGlobalContext } from '../../context/GlobalProvider';
import { useTheme } from '../../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;
const ITEM_WIDTH = screenWidth - 30;

export default function SettingsScreen() {
  const { theme } = useTheme();
  
  const {
    twoWeeksTimingData,
    twoWeeksCalendarData,
    city,
    timeRemaining,
    dateSelected,
    checkLocationPermission,
    slidebarActive,
    locationAllowed,
    nextPrayer,
    nextPrayerName,
    settingLastUpdate
  } = useGlobalContext();

  const [isDateScrollReady, setIsDateScrollReady] = useState(false);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hijriDate = twoWeeksCalendarData && twoWeeksCalendarData[dateSelected]?.hijri;
  const gregorianDate = twoWeeksCalendarData && twoWeeksCalendarData[dateSelected]?.gregorian;
  
  const getRelativeDateLabel = useCallback((date) => {
    if (!date) return '';
    
    const today = new Date();
    const compareDate = new Date(date.year, date.month.number - 1, date.day);
    
    today.setHours(0, 0, 0, 0);
    compareDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((compareDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return '';
  }, []);

  const handleDateChange = useCallback((index) => {
    if (flatListRef.current && index >= 0 && index < Object.keys(twoWeeksTimingData || {}).length) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  }, [twoWeeksTimingData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDateScrollReady(true);
      setCurrentIndex(7);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const renderItem = useCallback(({ item: [date, dayData] }) => (
    <View style={styles.mainCont}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {dayData ? (
          <>
            {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayerName) => (
              <TimingOption
                key={prayerName}
                name={prayerName}
                data={dayData[prayerName]}
                timeRemaining={timeRemaining}
                focus={nextPrayerName === prayerName && dayData[prayerName].date === nextPrayer?.date}
              />
            ))}
          </>
        ) : (
          <Text style={[{ color: Colors[theme].timingActive }, styles.timeDate]}>No data available</Text>
        )}
      </ScrollView>
    </View>
  ), [theme, timeRemaining, nextPrayerName, nextPrayer, settingLastUpdate]);

  const getItemLayout = useCallback((_, index) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  }), []);

  const memoizedData = useMemo(() => Object.entries(twoWeeksTimingData || {}), [twoWeeksTimingData, settingLastUpdate]);

  const relativeLabel = gregorianDate ? getRelativeDateLabel(gregorianDate) : '';

  return (
    <SafeAreaView style={[{ backgroundColor: Colors[theme].background, flex: 1 }]}>
      <ThemedView style={[{ flex: 1 }, styles.container]}>
        <IndexDecoration />
        <View style={{ zIndex: 2, flex: 1 }}>
          <View>
            <View style={styles.mainTitle}>
              <ThemedText type="title">{nextPrayerName}</ThemedText>
            </View>
            <View style={styles.timeLeft}>
              <TimmingIconSvg fill={theme === 'light' ? 'rgba(0, 0, 0, .7)' : 'rgba(255, 255, 255, .7)'} />
              <Text
                style={[
                  { color: theme === 'light' ? 'rgba(0, 0, 0, .7)' : 'rgba(255, 255, 255, .7)' },
                  styles.timeLeftText,
                ]}
              >
                {timeRemaining ? `${timeRemaining}` : 'Loading...'}
              </Text>
            </View>

            <View style={styles.Sadiqabad}>
              <Text style={[{ color: Colors[theme].focusColor }, styles.SadiqabadText]}>{city}</Text>
              <SadiqabadSvg fill={Colors[theme].focusColor} />
            </View>
            {isDateScrollReady && <DateScroll onDateChange={handleDateChange} />}
            <View style={styles.timeData}>
              <Text style={[styles.timeStile, { color: Colors[theme].timingActive }]}>
                {hijriDate
                  ? `${hijriDate.month.en} ${hijriDate.day}, ${hijriDate.year} ${hijriDate.designation.abbreviated}`
                  : "Loading Hijri date..."}
              </Text>
              <Text style={[styles.timeDate, { color: Colors[theme].timingActive }]}>
                {gregorianDate
                  ? `${relativeLabel ? `${relativeLabel}, ` : ''}${gregorianDate.weekday.en} ${gregorianDate.day}, ${gregorianDate.month.en} ${gregorianDate.year}`
                  : "Loading Gregorian date..."}
              </Text>
            </View>
          </View>
          <FlatList
            key={`flatlist-${settingLastUpdate}`}
            ref={flatListRef}
            data={Object.entries(twoWeeksTimingData || {})}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            getItemLayout={getItemLayout}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            updateCellsBatchingPeriod={50}
            windowSize={5}
            removeClippedSubviews={true}
            initialScrollIndex={7}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                if (flatListRef.current) {
                  flatListRef.current.scrollToIndex({ index: info.index, animated: true });
                }
              });
            }}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainCont: {
    flex: 1,
    width: ITEM_WIDTH,
  },
  scrollViewContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  mainTitle: {
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  Sadiqabad: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12
  },
  SadiqabadText: {
    fontSize: 13.27,
    fontWeight: '600',
    marginRight: 6,
  },
  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLeftText: {
    marginLeft: 16,
    fontSize: 16.5,
    fontWeight: '600',
  },
  timeData: {
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: 26,
    marginTop: 10,
  },
  timeStile: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeDate: {
    fontSize: 14,
    fontWeight: '600',
  },
});