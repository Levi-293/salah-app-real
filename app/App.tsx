import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import GlobalProvider from '../context/GlobalProvider';
import AppOpeningAnimation from '../components/slash/AppOpeningAnimation';
import * as Notifications from 'expo-notifications';
import * as NavigationBar from 'expo-navigation-bar';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { View, Platform, StatusBar, Button, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { setupNotificationListener } from '../components/services/PushNotifications';
import { setupFirebaseMessagingNotifications } from '../components/services/FirebaseMessaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger'
import logAnalyticsEvent from '../utils/analytics_logger'
import * as Sentry from '@sentry/react-native';
import UpdateChecker from '../components/UpdateChecker';

const CrashButton = () => {
  const { theme } = useTheme();
  
  // Only show in development
  if (__DEV__ !== true) {
    return null;
  }
  
  const triggerCrash = () => {
    Sentry.captureException(new Error('Test crash from crash button'));
    throw new Error('Test crash from crash button');
  };

  return (
    <TouchableOpacity
      onPress={triggerCrash}
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: Colors[theme].error,
        padding: 10,
        borderRadius: 8,
        zIndex: 9999,
      }}
    >
      <Text style={{ color: 'white' }}>Crash Test</Text>
    </TouchableOpacity>
  );
};

export default function RootLayout() {
  const { theme } = useTheme();
  const setupComplete = useRef(false);

  useEffect(() => {
    logger.info('Application loaded')
    logAnalyticsEvent('customIOS', {
        name: "Test Event for Analytics",
        platform: Platform.OS, // 'ios' or 'android'
      });
    if (!setupComplete.current) {
      setupComplete.current = true;
  
      async function setup() {
        try {
          await checkFirstLaunch();
          await setupNotificationListener();
          setupNotifications();
          
          // Safely initialize Firebase messaging
          try {
            await setupFirebaseMessagingNotifications();
          } catch (error) {
            console.log('Error setting up Firebase messaging:', error);
            // Continue app execution even if Firebase setup fails
          }
        } catch (error) {
          console.error('Error during setup:', error);
        }
      }
  
      setup();
    }
  
    return () => {
      // Cleanup function if needed
    };
  }, []);

  async function checkFirstLaunch() {
    try {
      const isFirstLaunch = await AsyncStorage.getItem('firstLaunch');
    //   console.log('First launch check:', isFirstLaunch);
    logger.info('Profile loaded', { isFirstLaunch: isFirstLaunch });
    logAnalyticsEvent('custom_event', { screen_name: 'home_test' });
      if (!isFirstLaunch) {
        await AsyncStorage.clear(); // Clear cache on first install
        await AsyncStorage.setItem('firstLaunch', 'true');
        console.log('Cache cleared on first launch after reinstall');
        // Delay to ensure all setup is complete
        await new Promise(resolve => setTimeout(resolve, 3000)); // Delay of 3 seconds
      }
    } catch (error) {
      console.error('Error clearing cache or setting first launch:', error);
    }
  }

  function setupNotifications() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Wrap in try/catch to handle cases when activity is no longer available
      try {
        // Use a flag to track component mount state
        let isMounted = true;
        
        const updateNavBar = async () => {
          if (isMounted) {
            await NavigationBar.setBackgroundColorAsync(Colors[theme].background);
          }
        };
        
        updateNavBar().catch(error => {
          console.warn('Failed to update navigation bar:', error);
        });
        
        // Cleanup function to prevent calls after unmount
        return () => {
          isMounted = false;
        };
      } catch (error) {
        console.warn('Error setting navigation bar color:', error);
      }
    }
  }, [theme]);

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors[theme].background }} edges={['top']}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      </SafeAreaView>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Check for app updates - optional update mode (dismissible) */}
        <UpdateChecker checkOnMount={true} forceUpdate={false} />
      <SafeAreaView style={[{ flex: 1, backgroundColor: Colors[theme].background }, Platform.OS === 'ios' && { paddingTop: 0 }]} edges={['left', 'right', 'bottom']}>
        <AppOpeningAnimation />
      <GlobalProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </GlobalProvider>
        <CrashButton />
        {Platform.OS === 'ios' && (
          <View
            style={{
              height: 0,
              backgroundColor: Colors[theme].background,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />
        )}
      </SafeAreaView>
      </GestureHandlerRootView>
    </>
  );
}
