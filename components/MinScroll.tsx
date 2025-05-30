import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import RigthArrowSvg from '../assets/svg/RigthArrowSvg';
import LeftArrowSvg from '../assets/svg/LeftArrowSvg';
import { Colors } from '../constants/Colors';
import ScrollComp from './ScrollComp';
import { registerForPushNotificationsAsync, scheduleNotification } from './notificationService';
import { useTheme } from '../context/ThemeContext';
import { useGlobalContext } from '../context/GlobalProvider';

const ITEM_WIDTH = 80;
const OFFSET_FOR_CENTER = ITEM_WIDTH / 2;

export default function MinScroll({ data }) {
  const { notification, notificationStatus, setNotificationStatus, saveNotificationStatus, city, setupPushNotification } = useGlobalContext();
  const { theme } = useTheme();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLeftDisabled, setIsLeftDisabled] = useState(true);
  const [isRightDisabled, setIsRightDisabled] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    async function getToken() {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
    }
    getToken();
  }, []);

  const addMinutesToTime = (minutes) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };
  
  const updateNotificationStatus = async (selectedTime, shouldDisplayExampleNotification) => {
    const newTime = addMinutesToTime(Number(selectedTime));
    const formattedTime = formatTime(newTime);
    setNotificationStatus(prev => {
      const newStatus = { 
        ...prev, 
        [data.name]: { 
          ...prev[data.name],
          timing: selectedTime,
          adhan: prev[data.adhan]
        } 
      };
      saveNotificationStatus(newStatus);
      setupPushNotification(newStatus);
      return newStatus;
    });
    
    if (shouldDisplayExampleNotification && notification) {
      await scheduleNotification(
        `${data.name} in ${selectedTime} minutes in ${city}`, 
        'This is an example notification', 
        false
      );
    }
  };

  const scrollData = [
    { second: 'None', third: '' },
    { second: '5', third: 'min' },
    { second: '10', third: 'min' },
    { second: '15', third: 'min' },
    { second: '25', third: 'min' },
    { second: '30', third: 'min' },
  ];

  const updateArrowStates = (index) => {
    setIsLeftDisabled(index === 0);
    setIsRightDisabled(index === scrollData.length - 1);
  };

  const scrollToIndex = (index, shouldDisplayExampleNotification) => {
    if (index >= 0 && index < scrollData.length) {
      let scrollOffset = index * ITEM_WIDTH;
      
      // Apply offset for indices 1 and 2, but not for 0 or last index
      if (index === 1 || (index === 2 && scrollData.length > 3)) {
        scrollOffset -= OFFSET_FOR_CENTER;
      }
      
      scrollViewRef.current?.scrollTo({x: scrollOffset, animated: true});
      setCurrentIndex(index);
      updateArrowStates(index);
      updateNotificationStatus(scrollData[index].second, index !== 0 && shouldDisplayExampleNotification);
    }
  };

  const scrollToIndexFirstTime = (index) => {
    if (index >= 0 && index < scrollData.length) {
      let scrollOffset = index * ITEM_WIDTH;
      
      // Apply offset for indices 1 and 2, but not for 0 or last index
      if (index === 1 || (index === 2 && scrollData.length > 3)) {
        scrollOffset -= OFFSET_FOR_CENTER;
      }
      
      scrollViewRef.current?.scrollTo({x: scrollOffset, animated: true});
      setCurrentIndex(index);
      updateArrowStates(index);
    }
  };

  const handleArrowPress = (direction) => {
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    scrollToIndex(newIndex, false);
  };

  const handleItemPress = (index) => {
    scrollToIndex(index, true);
  };

  // Initialize the scroll position and selected index
  useEffect(() => {
    const initialIndex = scrollData.findIndex(item => item.second === notificationStatus[data.name]?.timing);
    if (initialIndex !== -1) {
      scrollToIndexFirstTime(initialIndex);
    }
  }, []);

  return (
    <View style={styles.mainCont}>
      <TouchableOpacity 
        style={styles.arrowCont} 
        onPress={() => handleArrowPress('left')}
        disabled={isLeftDisabled}
      >
        <LeftArrowSvg fill={isLeftDisabled ? Colors[theme].disabledColor : Colors[theme].focusColor} />
      </TouchableOpacity>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollView}
      >
        {scrollData.map((item, index) => (
          <ScrollComp
            key={index}
            second={item.second.toString()}
            third={item.third}
            active={index === currentIndex}
            onClick={() => handleItemPress(index)}
          />
        ))}
      </ScrollView>
      <TouchableOpacity 
        style={styles.arrowCont} 
        onPress={() => handleArrowPress('right')}
        disabled={isRightDisabled}
      >
        <RigthArrowSvg fill={isRightDisabled ? Colors[theme].disabledColor : Colors[theme].focusColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollView: {
    paddingHorizontal: 0,
  },
  arrowCont: {
    paddingHorizontal: 10,
  },
});