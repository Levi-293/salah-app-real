// Safely import Firebase analytics with try/catch to handle builds where Firebase is removed
let analytics = null;
try {
  analytics = require('@react-native-firebase/analytics').default;
} catch (error) {
  console.log('Firebase analytics module not available');
}

// Import the Expo Firebase Analytics wrapper
import expoAnalytics from './expo_analytics_wrapper';
import { Platform } from 'react-native';

export default async function logAnalyticsEvent(eventName, params = {}) {
  try {
    //uncomment below code if you dont want logs in development
    // if (__DEV__) {
    //   console.log('Analytics disabled in development mode');
    //   return;
    // }
    
    // Add platform to all events
    const enhancedParams = {
      ...params,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    };
    
    // Track success of each analytics service
    let firebaseSuccess = false;
    let expoSuccess = false;
    
    // Try to log with Firebase Analytics if available
    if (analytics) {
      try {
        // Check if analytics() returns a valid object with logEvent method
        const analyticsInstance = analytics();
        if (analyticsInstance && typeof analyticsInstance.logEvent === 'function') {
          await analyticsInstance.logEvent(eventName, enhancedParams);
          firebaseSuccess = true;
          console.log('[Firebase Analytics] Event logged successfully:', eventName);
        } else {
          console.log('[Firebase Analytics] Invalid analytics instance, skipping event logging');
        }
      } catch (firebaseError) {
        console.error('[Firebase Analytics] Error logging event:', firebaseError);
      }
    } else {
      console.log('[Firebase Analytics] Module not available, skipping event logging');
    }
    
    // Try to log with Expo Firebase Analytics
    try {
      await expoAnalytics.logEvent(eventName, enhancedParams);
      expoSuccess = true;
      console.log('[Expo Analytics] Event logged successfully:', eventName);
    } catch (expoError) {
      console.error('[Expo Analytics] Error logging event:', expoError);
    }
    
    // If both analytics services failed, log a warning
    if (!firebaseSuccess && !expoSuccess) {
      console.warn('[Analytics] Failed to log event with any analytics service:', eventName);
    }

  } catch (error) {
    console.error('[Analytics] Error logging event:', {
      eventName,
      params,
      errorCode: error.code,
      errorMessage: error.message,
      errorStack: error.stack
    });
  }
}