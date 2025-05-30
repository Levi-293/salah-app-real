import axios from 'axios';

// Create a reusable Axios instance with timeouts
const apiClient = axios.create({
  baseURL: 'https://api.aladhan.com/v1',
  timeout: 5000, // Set a 5-second timeout to handle slow responses
});

// Retry logic in case of network slowness
const retryAxiosRequest = async (requestFunc, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFunc();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
    }
  }
};

export const QiblaDirection = (latitude, longitude) => {
  return retryAxiosRequest(() => apiClient.get(`/qibla/${latitude}/${longitude}`));
};

export const GregorianDates = (date) => {
  return retryAxiosRequest(() => apiClient.get(`/gToH/${date}`
  ));
};

export const TimingData = (date, latitude, longitude, madhab, country, isAutoDetect, selectedCalculationMethod, highAltitudeMethod, customAdjustments) => {
  return retryAxiosRequest(() => apiClient.get(`/timings/${date}`, {
    params: {
      latitude: latitude,
      longitude: longitude,
      method: isAutoDetect ? (country === 'United Kingdom' ? 15 : undefined) : selectedCalculationMethod, // Add UK-specific method
      school: madhab === 'Earlier Asr' ? 0 : 1, // 0 is Hanafi, 1 is Shafi'i
      latitudeAdjustmentMethod: isAutoDetect ? undefined : highAltitudeMethod,
      // tune: isAutoDetect ? undefined : `0,${customAdjustments.Fajr},${customAdjustments.Sunrise},${customAdjustments.Dhuhr},${customAdjustments.Asr},${customAdjustments.Maghrib},${customAdjustments.Isha},0`,
    },
  }));
};

export const AutoTimingData = (date, latitude, longitude, madhab, country) => {
  return retryAxiosRequest(() => apiClient.get(`/timings/${date}`, {
    params: {
      latitude: latitude,
      longitude: longitude,
      method: country === 'United Kingdom' ? 15 : undefined, // Add UK-specific method
      school: madhab === 'Earlier Asr' ? 0 : 1, // 0 is Hanafi, 1 is Shafi'i
    },
  }));
};
