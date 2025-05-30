import * as Notifications from "expo-notifications";
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { router } from "expo-router";
import { DuaData, fetchDuasByCategory } from "./FirebaseService"; // Adjust path as needed

const BACKGROUND_FETCH_TASK = "background-fetch-task";
const BACKGROUND_AUDIO_TASK = "background-audio-task";

// Sound and notification variables
let sound: Audio.Sound | null = null;
let notificationListener: Notifications.Subscription | null = null;
const SOUND_MAP: Record<string, any> = {
  "Madinah.wav": require("../../assets/sounds/Madinah.wav"),
  "Makkah.wav": require("../../assets/sounds/Makkah.wav"),
  "Mishari.wav": require("../../assets/sounds/Mishari.wav"),
  "isti11.mp3": require("../../assets/sounds/isti11.mp3"),
};

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    
    try {
      // Configure audio session for both platforms
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        allowsRecordingIOS: false,
      });

      if (Platform.OS === 'ios' && data.adhan) {
        // For iOS, play sound from assets folder
        await playLocalSound(data.adhan as string);
      }
      // Android will play sound from res folder through the notification system
    } catch (error) {
      console.error('Error configuring audio:', error);
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: Platform.OS === 'android', // Only Android uses system sound
      shouldSetBadge: true,
      sound: Platform.OS === 'ios' ? null : undefined, // Explicitly set sound to null for iOS
    };
  },
});

// Android-specific channel IDs
let notificationChannelId = "prayer-times";
const notificationEarlyChannelId = "early-times";

// Utility functions
const formatPrayerDateString = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Background fetch task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = new Date();
  const key = formatPrayerDateString(now);
  const storedPrayerTimes = await AsyncStorage.getItem(`prayerTimes[${key}]`);

  if (storedPrayerTimes) {
    const prayerTimes: TimingData = JSON.parse(storedPrayerTimes);
    const currentPrayer = Object.values(prayerTimes).find(
      (prayer) => Math.abs(prayer.timestamp - now.getTime()) < 60000
    );

    if (currentPrayer) {
      const notificationStatus = await AsyncStorage.getItem(
        "NotificationStatus"
      );
      const parsedStatus = notificationStatus
        ? JSON.parse(notificationStatus)
        : {};
      const adhanPath =
        parsedStatus[currentPrayer.name]?.adhan || 'Mishari.wav';
      const adhanFilename = adhanPath.split("/").pop() || "Mishari.wav";

      // Platform-specific handling
      const content: Notifications.NotificationContentInput = {
        title: `It's time for ${currentPrayer.name}`,
        body: `The time is ${currentPrayer.time}`,
        data: { adhan: adhanPath },
      };

      if (Platform.OS === "ios") {
        content.sound = adhanFilename;
        await playLocalSound(adhanFilename);
      } else {
        content.android = { channelId: notificationChannelId };
      }

      await Notifications.scheduleNotificationAsync({
        content,
        trigger: null,
      });
    }
  }
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// Audio functions
export async function playLocalSound(filename: string) {
  try {
    // Configure audio mode first
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
    });

    // Unload any existing sound
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }

    console.log('Loading sound:', filename);
    const soundFile = SOUND_MAP[filename] || SOUND_MAP['Mishari.wav'];
    const { sound: newSound } = await Audio.Sound.createAsync(soundFile, {
      shouldPlay: true,
      volume: 1.0,
      rate: 1.0,
      progressUpdateIntervalMillis: 1000,
    });

    sound = newSound;
    console.log('Playing sound:', filename);

    // Wait for the sound to finish
    return new Promise((resolve, reject) => {
      sound?.setOnPlaybackStatusUpdate((status: any) => {
        if (status.error) {
          console.error('Sound playback error:', status.error);
          reject(status.error);
        }
        if (status.isLoaded && status.didJustFinish) {
          console.log('Sound finished playing:', filename);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error playing sound:', error);
    throw error;
  }
}

// Notification setup
async function setupNotificationChannel() {
  if (Platform.OS === "android") {
    const adhanSound = (await AsyncStorage.getItem("adhanSound")) || "mishari";
    notificationChannelId = `prayer-times-${adhanSound.toLowerCase()}`;

    // Create/update channels
    await Notifications.setNotificationChannelAsync(notificationChannelId, {
      name: "Prayer Times",
      importance: Notifications.AndroidImportance.MAX,
      sound: adhanSound.toLowerCase(),
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true, // Bypass Do Not Disturb
    });

    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync(
      notificationEarlyChannelId,
      {
        name: "Early Prayer Times",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
      }
    );
  }
}

// Notification scheduling
function scheduleNotifications(
  prayerTimes: TimingData,
  city: string,
  notificationStatus: Record<
    string,
    { status: string; timing: string; adhan: string }
  >
) {
  // Track if we've already scheduled a Sunrise notification to prevent duplicates
  let sunriseScheduled = false;

  Object.entries(prayerTimes).forEach(([key, prayer]) => {
    const prayerStatus = notificationStatus[prayer.name];
    if (prayerStatus.status === "unactive") return;

    const now = new Date();
    const timeDiffInSeconds = Math.floor(
      (prayer.timestamp - now.getTime()) / 1000
    );
    if (timeDiffInSeconds <= 0) return;

    // Special handling for Sunrise to prevent duplicates
    if (prayer.name === "Sunrise") {
      if (sunriseScheduled) {
        console.log("Skipping duplicate Sunrise notification");
        return;
      }
      sunriseScheduled = true;
    }

    const adhanFilename = prayerStatus.adhan?.split("/").pop() || "Mishari.wav";
    const content: Notifications.NotificationContentInput = {
      title: `${prayer.name} at ${prayer.time}`,
      body:
        prayer.name === "Sunrise"
          ? `It's now ${prayer.name}`
          : `It's time to pray ${prayer.name}`,
      data: { adhan: prayerStatus.adhan },
    };

    if (Platform.OS === "ios") {
      content.sound =
        prayerStatus.status === "activeAdan" ? adhanFilename : "default";
    } else {
      content.android = {
        channelId:
          prayerStatus.status === "activeAdan"
            ? notificationChannelId
            : "default",
      };
    }

    console.log(
      "scheduling notification",
      prayer.name,
      timeDiffInSeconds / 60
    );

    Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        seconds: timeDiffInSeconds,
        channelId:
          prayerStatus.status === "activeAdan"
            ? notificationChannelId
            : "default",
      },
    });

    scheduleEarlyReminder(prayer, city, prayerStatus.timing, timeDiffInSeconds);
  });
}

function scheduleEarlyReminder(
  prayer: { name: string; time: string },
  city: string,
  timing: string,
  timeDiffInSeconds: number
) {
  if (timing === "None") return;
  const timingInSeconds = parseInt(timing) * 60;
  if (timeDiffInSeconds - timingInSeconds <= 0) return;

  const content: Notifications.NotificationContentInput = {
    title: `${prayer.name} at ${prayer.time}`,
    body: `${prayer.name} in ${timing} minutes (${prayer.time}) in ${city}`,
  };

  if (Platform.OS === "ios") {
    content.sound = "default";
  } else {
    content.android = { channelId: notificationEarlyChannelId };
  }

  Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      seconds: timeDiffInSeconds - timingInSeconds,
      channelId: notificationEarlyChannelId,
    },
  });
}

// Main export function
export async function PushNotificationFunction(
  isNotificationEnabled: boolean,
  twoWeeksTimingData: Record<string, TimingData> | null,
  city: string | null,
  notificationStatus: Record<
    string,
    { status: string; timing: string; adhan: string }
  > | null
) {
  if (!twoWeeksTimingData || !city || !notificationStatus) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!isNotificationEnabled) return;

    await setupNotificationChannel();

    const now = new Date();
    const dates = [now, new Date(now.getTime() + 24 * 60 * 60 * 1000)];

    for (const date of dates) {
      const dateString = formatPrayerDateString(date);
      const timingData = twoWeeksTimingData[dateString];
      if (timingData) {
        scheduleNotifications(timingData, city, notificationStatus);
        await AsyncStorage.setItem(
          `prayerTimes[${dateString}]`,
          JSON.stringify(timingData)
        );
      }
    }

    await registerBackgroundFetch();
  } catch (err) {
    console.error("Error in PushNotificationFunction:", err);
  }
}

async function registerBackgroundFetch() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: Platform.OS === "ios" ? 60 * 15 : 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (err) {
    console.error("Background fetch registration failed:", err);
  }
}

// Notification listener setup
export async function setupNotificationListener() {
  if (notificationListener) return;

  try {
    // Set up audio mode for iOS
    if (Platform.OS === 'ios') {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        allowsRecordingIOS: false,
      });
    }

    // Add notification received listener for logging
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification.request.content);
    });

    // Add notification response listener for handling user interaction
    notificationListener = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        console.log('Notification response received:', response.notification.request.content);
        const data = response.notification.request.content.data;

        // Handle Dua navigation
        if (data?.duaId) {
          const { duaId, categoryId, categoryName } = data;
          // ... navigation logic ...
        }
      }
    );

    console.log('Notification listeners set up successfully');
  } catch (error) {
    console.error('Notification setup error:', error);
  }
}
