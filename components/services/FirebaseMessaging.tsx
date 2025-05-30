// Safely import Firebase messaging with try/catch to handle builds where Firebase is removed
let messaging: any = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (error) {
  console.log('Firebase messaging module not available');
}
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { router } from 'expo-router';
import { DuaData, fetchDuasByCategory } from './FirebaseService';
import DeviceInfo from 'react-native-device-info';
import { DeviceEventEmitter, Platform, ActivityIndicator, View, Alert } from 'react-native';
import { db } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

interface DeviceToken {
  token: string;
  deviceId: string;
  platform: 'ios' | 'android';
  model: string;
  systemVersion: string;
  lastUpdated: Timestamp;
  appVersion: string;
  isActive: boolean;
}

// Global loading state
let isLoading = false;

const LoadingComponent = () => (
  <View style={{ 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
  }}>
    <ActivityIndicator size="large" color="#ffffff" />
  </View>
);

// Loading overlay component
export const LoadingOverlayComponent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showListener = DeviceEventEmitter.addListener('showLoadingOverlay', () => {
      setVisible(true);
    });

    const hideListener = DeviceEventEmitter.addListener('hideLoadingOverlay', () => {
      setVisible(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  if (!visible) return null;
  return <LoadingComponent />;
};

function showLoading() {
  if (!isLoading) {
    isLoading = true;
    DeviceEventEmitter.emit('showLoadingOverlay');
  }
}

function hideLoading() {
  if (isLoading) {
    isLoading = false;
    DeviceEventEmitter.emit('hideLoadingOverlay');
  }
}

async function getDeviceId(): Promise<string> {
  return Platform.OS === 'ios' 
    ? await DeviceInfo.getUniqueId() 
    : await DeviceInfo.getAndroidId();
}

async function saveTokenToFirestore(token: string) {
  try {
    const deviceId = await getDeviceId();
    
    const tokenDoc: DeviceToken = {
      token,
      deviceId,
      platform: Platform.OS as 'ios' | 'android',
      model: DeviceInfo.getModel(),
      systemVersion: DeviceInfo.getSystemVersion(),
      lastUpdated: Timestamp.now(),
      appVersion: DeviceInfo.getVersion(),
      isActive: true
    };

    await setDoc(
      doc(db, 'device_tokens', deviceId),
      tokenDoc,
      { merge: true }
    );

    console.log('FCM token saved to Firestore');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}

let notificationSubscription: any = null;

export function setupNotificationListener() {
  console.log('Setting up FCM notification listener');
  
  if (notificationSubscription) {
    notificationSubscription.remove();
  }
  
  notificationSubscription = DeviceEventEmitter.addListener('FCMNotificationTapped', (notification) => {
    console.log('FCM notification tapped:', notification);
    if (notification.type === 'dua_notification') {
      handleDuaNotification(notification);
    }
  });
  
  console.log('FCM notification listener setup complete:', !!notificationSubscription);
}

export async function setupFirebaseMessagingNotifications() {
  // Check if Firebase messaging is available
  if (!messaging) {
    console.log('Firebase messaging is not available in this build');
    return;
  }

  const canRequestNotification = await AsyncStorage.getItem('canRequestNotification');
  if (!canRequestNotification) return;

  try {
    const authStatus = await messaging().requestPermission();
    
    if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      setupNotificationListener();

      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      await messaging().subscribeToTopic('all');
      console.log('Successfully subscribed to topic "all"');
      
      await saveTokenToFirestore(token);

      messaging().onTokenRefresh(async (newToken) => {
        console.log('FCM Token refreshed');
        await saveTokenToFirestore(newToken);
      });

      messaging().onMessage(async remoteMessage => {
        console.log('Received foreground message:', remoteMessage);
        if (remoteMessage.data?.type === 'dua_notification') {
          await handleDuaNotification(remoteMessage.data);
        }
      });

      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Received background message:', remoteMessage);
        if (remoteMessage.data?.type === 'dua_notification') {
          await handleDuaNotification(remoteMessage.data);
        }
      });

      messaging().onNotificationOpenedApp(async remoteMessage => {
        console.log('Notification opened app:', remoteMessage);
        if (remoteMessage.data?.type === 'dua_notification') {
          await handleDuaNotification(remoteMessage.data);
        }
      });

      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification?.data?.type === 'dua_notification') {
        console.log('App opened from notification:', initialNotification);
        await handleDuaNotification(initialNotification.data);
      }
    } else {
      console.log('User notification permission denied');
    }
  } catch (error) {
    console.log('Error in setupFirebaseMessagingNotifications:', error);
  }
}

async function handleDuaNotification(data: any) {
  const { duaId, categoryId, categoryName } = data;

  try {
    showLoading();
    let fetchedDuas: DuaData[] = [];
    
    const { error } = await fetchDuasByCategory(categoryId, (duas) => {
      fetchedDuas = duas;
    });
    
    if (error) {
      Alert.alert(
        "Error",
        "Failed to fetch dua details. Please try again later.",
        [{ text: "OK" }]
      );
      console.error("Error fetching duas:", error);
      return;
    }

    const dua = fetchedDuas.find(d => d.id === duaId);

    if (dua) {
      router.push({
        pathname: '/dua_detail',
        params: {
          duaData: JSON.stringify(dua),
          categoryName: categoryName
        }
      });
    } else {
      Alert.alert(
        "Not Found",
        "The requested dua could not be found.",
        [{ text: "OK" }]
      );
    }
  } catch (error) {
    Alert.alert(
      "Error",
      "An unexpected error occurred. Please try again later.",
      [{ text: "OK" }]
    );
    console.error('Error handling dua notification:', error);
  } finally {
    hideLoading();
  }
}