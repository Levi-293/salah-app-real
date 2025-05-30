import React, { useEffect } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { AudioProvider } from '../context/AudioContext';
import RootLayout from './App';
import { 
  registerForPushNotificationsAsync
} from '../components/notificationService';
import { LoadingOverlayComponent } from '../components/services/FirebaseMessaging';
import * as Sentry from '@sentry/react-native';
import { initSentry } from '@/utils/logger';
import analytics from '@react-native-firebase/analytics';
import firebase from '@react-native-firebase/app';

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  const firebaseConfig = {
    appId: '1:974359293027:ios:dbc58488c5db045396dc56',
    projectId: 'salah-353f3',
    apiKey: 'AIzaSyB4-WeA9RAudJQRkTAPxPY2wZ3Wl0_0_Mo',
    storageBucket: 'salah-353f3.appspot.com',
    messagingSenderId: '974359293027',
  };
  
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
}

// Enable analytics collection
analytics().setAnalyticsCollectionEnabled(true)
  .then(() => {
    console.log('Analytics collection enabled');
    // Log a test event
    return analytics().logEvent('app_opened', {
      platform: 'ios',
      timestamp: new Date().toISOString()
    });
  })
  .then(() => console.log('Test event logged successfully'))
  .catch(error => console.error('Error with Firebase setup:', error));

initSentry()

export default Sentry.wrap(function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
    return () => { };
  }, []);

  return (
    <ThemeProvider>
      <AudioProvider>
        <RootLayout />
        <LoadingOverlayComponent />
      </AudioProvider>
    </ThemeProvider>
  );
});