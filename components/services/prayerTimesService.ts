import AsyncStorage from '@react-native-async-storage/async-storage';
import { AutoTimingData } from "../../config/httprouter";

const PRAYER_TIMES_CACHE_KEY = 'CACHED_PRAYER_TIMES';
const LAST_FETCH_TIME_KEY = 'LAST_PRAYER_TIMES_FETCH';

interface PrayerTimes {
  date: string;
  timings: {
    [key: string]: string;
  };
}

export const cachePrayerTimes = async (prayerTimes: PrayerTimes[]) => {
  try {
    await AsyncStorage.setItem(PRAYER_TIMES_CACHE_KEY, JSON.stringify(prayerTimes));
    await AsyncStorage.setItem(LAST_FETCH_TIME_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error caching prayer times:', error);
  }
};

export const getCachedPrayerTimes = async (): Promise<PrayerTimes[] | null> => {
  try {
    const cachedData = await AsyncStorage.getItem(PRAYER_TIMES_CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error getting cached prayer times:', error);
    return null;
  }
};

export const shouldFetchNewPrayerTimes = async (): Promise<boolean> => {
  try {
    const lastFetchTime = await AsyncStorage.getItem(LAST_FETCH_TIME_KEY);
    if (!lastFetchTime) return true;

    const lastFetch = new Date(lastFetchTime);
    const now = new Date();
    const hoursSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60 * 60);
    
    // Fetch new data if it's been more than 24 hours
    return hoursSinceLastFetch > 24;
  } catch (error) {
    console.error('Error checking last fetch time:', error);
    return true;
  }
};

export const getPrayerTimes = async (
  latitude: number,
  longitude: number,
  method: number,
  month: number,
  year: number
): Promise<PrayerTimes[] | null> => {
  try {
    // First check if we should fetch new data
    const shouldFetch = await shouldFetchNewPrayerTimes();
    if (!shouldFetch) {
      const cachedData = await getCachedPrayerTimes();
      if (cachedData) {
        return cachedData;
      }
    }

    // If we should fetch or no cache exists, fetch new data
    const response = await fetch(
      `http://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch prayer times');
    }

    const data = await response.json();
    const prayerTimes = data.data;

    // Cache the new data
    await cachePrayerTimes(prayerTimes);

    return prayerTimes;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    
    // If fetch fails, try to return cached data
    const cachedData = await getCachedPrayerTimes();
    return cachedData;
  }
};

export const formatPrayerTime = (time: string, use12Hour: boolean): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  
  if (use12Hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  }
  
  return `${hours}:${minutes}`;
};
