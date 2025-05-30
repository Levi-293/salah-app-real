import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// Sound map for local files
const SOUND_MAP: Record<string, any> = {
  "Madinah.wav": require("../assets/sounds/Madinah.wav"),
  "Makkah.wav": require("../assets/sounds/Makkah.wav"),
  "Mishari.wav": require("../assets/sounds/Mishari.wav"),
  "isti11.mp3": require("../assets/sounds/isti11.mp3"),
};

// Global variables to store the current notification and Adhan sound instance
let currentNotification = null;
let globalAdhanSound = null;
let globalAlert = null;

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  const canRequestNotification = await AsyncStorage.getItem(
    "canRequestNotification"
  );
  if (!canRequestNotification) return;

  // Configure notification channel for Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX, // High importance for prominence
      vibrationPattern: [0, 250, 250, 250], // Vibration pattern
      lightColor: "#FF231F7C", // LED light color
      sound: "default", // Enable sound for the channel
    });
  } else if (Platform.OS === "ios") {
    // Set up iOS notification categories with actions and options
    await Notifications.setNotificationCategoryAsync('adhan', [
      {
        identifier: 'stop',
        buttonTitle: 'Stop Adhan',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false
        }
      }
    ], {
      previewPlaceholder: 'Prayer Time Notification'
    });
  }

  // Request permissions with specific options for iOS
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
        allowCriticalAlerts: true,
        provideAppNotificationSettings: true,
      }
    });
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get notification permissions!");
    return;
  }

  // Set the notification handler for iOS
  // Set up notification handler
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      if (Platform.OS === 'ios') {
        const adhanSound = notification.request.content.data?.adhanSound;
        if (adhanSound) {
          await playAdhanSound(adhanSound);
        }
      }
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });

  return "iOS does not require a token for local notifications";
}

// Configure audio settings globally or before playback
async function configureAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true, // Keep audio alive in background
    playsInSilentModeIOS: true, // Play even in silent mode
    shouldDuckAndroid: true, // Lower volume of other apps on Android
  });
}

export async function playAdhanSound(adhanSound: string) {
  try {
    await configureAudioMode(); // Set audio mode before playing
    await stopAdhanSound();

    console.log("Playing sound:", adhanSound);

    const soundSource = SOUND_MAP[adhanSound] || { uri: adhanSound };
    console.log("Using sound source:", soundSource);

    const { sound } = await Audio.Sound.createAsync(
      soundSource,
      { shouldPlay: true },
      (playbackStatus) => {
        if (playbackStatus.didJustFinish) {
          sound.unloadAsync(); // Unload when finished
        }
      }
    );
    globalAdhanSound = sound;

    await sound.playAsync();
  } catch (error) {
    console.error("Error playing Adhan sound:", error);
  }
}

// Stop the Adhan sound
export async function stopAdhanSound() {
  if (globalAdhanSound) {
    try {
      await globalAdhanSound.stopAsync(); // Stop the sound
      await globalAdhanSound.unloadAsync(); // Unload the sound
    } catch (error) {
      console.error("Error stopping Adhan sound:", error);
    }
    globalAdhanSound = null; // Reset the global sound instance
  }
}

// Schedule a notification
export async function scheduleNotification(
  title: string,
  body: string,
  playAdhan = false,
  adhanSound?: string,
  trigger: any = null
) {
  try {
    const adhanSoundFilename = playAdhan
      ? adhanSound?.split("/").pop()
      : "Default";
    console.log(`adhanSound: ${adhanSound}`);
    console.log(`Scheduling notification with sound: ${adhanSoundFilename}`);

    AsyncStorage.setItem(
      "adhanSound",
      adhanSoundFilename?.toString()?.toLocaleLowerCase().split(".")[0]
    );
    console.log(adhanSound);

    // Play adhan sound if enabled
    if (playAdhan && adhanSound) {
      await playAdhanSound(adhanSound);
    }

    // Notification content
    const notificationContent = {
      title,
      body,
      sound: adhanSoundFilename, // Sound file name (or 'default')
      priority: Notifications.AndroidNotificationPriority.HIGH, // High priority for prominence
      vibrate: [0, 250, 250, 250], // Vibration pattern
      lightColor: "#FF231F7C", // LED light color
      data: { adhanSound: adhanSound }, // Additional data
    };

    // Platform-specific settings
    if (Platform.OS === 'ios') {
      if (playAdhan) {
        // For iOS, we handle sound manually
        notificationContent.sound = null;
        (notificationContent as any).categoryIdentifier = 'adhan';
      } else {
        notificationContent.sound = 'default';
      }
    } else {
      // For Android, include the sound in notification
      notificationContent.sound = adhanSoundFilename;
    }

    console.log(notificationContent);

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null, // Trigger immediately
      channelId: "default", // Use the default notification channel
    });

    // Store the current notification
    currentNotification = {
      request: {
        identifier: notificationId,
        content: notificationContent,
      },
    };
  } catch (error) {
    console.error("Error during notification scheduling:", error);
  }
}

// Clear all notifications and stop Adhan sound
export async function clearAllNotificationsAndSound() {
  try {
    await stopAdhanSound(); // Stop Adhan sound
    await Notifications.cancelAllScheduledNotificationsAsync(); // Cancel scheduled notifications
    await Notifications.dismissAllNotificationsAsync(); // Dismiss displayed notifications
    await Notifications.setBadgeCountAsync(0); // Reset badge count
  } catch (error) {
    console.error("Error clearing notifications and stopping sound:", error);
  }
}