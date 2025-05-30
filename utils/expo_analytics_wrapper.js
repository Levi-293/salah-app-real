// Safe wrapper for expo-firebase-analytics
import { Platform } from 'react-native';

// Create a mock implementation for when the module is not available
const mockAnalytics = {
  logEvent: (name, properties) => {
    console.log('[Expo Analytics Mock] Event logged:', name, properties);
    return Promise.resolve();
  },
  setCurrentScreen: (screenName) => {
    console.log('[Expo Analytics Mock] Screen set:', screenName);
    return Promise.resolve();
  },
  setUserId: (userId) => {
    console.log('[Expo Analytics Mock] User ID set:', userId);
    return Promise.resolve();
  },
  setUserProperties: (properties) => {
    console.log('[Expo Analytics Mock] User properties set:', properties);
    return Promise.resolve();
  },
  setAnalyticsCollectionEnabled: (enabled) => {
    console.log('[Expo Analytics Mock] Collection enabled:', enabled);
    return Promise.resolve();
  }
};

// Try to import the real module, fall back to mock if not available
let ExpoFirebaseAnalytics;
try {
  // Dynamic import to avoid bundling issues
  ExpoFirebaseAnalytics = require('expo-firebase-analytics');
  
  // Additional check to ensure the native module exists
  if (!ExpoFirebaseAnalytics.logEvent) {
    // Using silent log instead of warning to avoid emulator warnings
    if (__DEV__) {
      console.log('Expo Firebase Analytics methods not found, using mock implementation');
    }
    ExpoFirebaseAnalytics = mockAnalytics;
  }
} catch (error) {
  // Using silent log instead of warning to avoid emulator warnings
  if (__DEV__) {
    console.log('Expo Firebase Analytics not available, using mock implementation');
  }
  ExpoFirebaseAnalytics = mockAnalytics;
}

// Export a safe version of the analytics functions
export const logExpoAnalyticsEvent = async (eventName, params = {}) => {
  try {
    const enhancedParams = {
      ...params,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    };
    
    await ExpoFirebaseAnalytics.logEvent(eventName, enhancedParams);
    console.log('[Expo Analytics] Event logged successfully:', eventName, enhancedParams);
  } catch (error) {
    console.error('[Expo Analytics] Error logging event:', error);
  }
};

export const setExpoAnalyticsScreen = async (screenName, screenClass = null) => {
  try {
    await ExpoFirebaseAnalytics.setCurrentScreen(screenName, screenClass);
    console.log('[Expo Analytics] Screen set:', screenName);
  } catch (error) {
    console.error('[Expo Analytics] Error setting screen:', error);
  }
};

export const setExpoAnalyticsUser = async (userId) => {
  try {
    await ExpoFirebaseAnalytics.setUserId(userId);
    console.log('[Expo Analytics] User ID set:', userId);
  } catch (error) {
    console.error('[Expo Analytics] Error setting user ID:', error);
  }
};

export default {
  logEvent: logExpoAnalyticsEvent,
  setCurrentScreen: setExpoAnalyticsScreen,
  setUserId: setExpoAnalyticsUser
};
