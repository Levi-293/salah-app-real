import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class LocationService {
  static async getLocation() {
    try {
      const cachedLocation = await this.getCachedLocation();

      if (cachedLocation) {
        console.log('Using cached location:', cachedLocation);
        return cachedLocation;
      }

      return await this.getUpdatedLocation();
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  static async getUpdatedLocation() {
    try {
      console.log('Requesting location permissions...');
      let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.error('Foreground permission denied with status:', foregroundStatus);
        throw new Error('Permission to access location was denied');
      }
      
      console.log('Foreground permission granted, status:', foregroundStatus);

      // Only request background permissions if we're not in onboarding
      const isFirstTime = await AsyncStorage.getItem('isFirstTime');
      if (isFirstTime === 'false') {
        try {
          const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
          console.log('Background permission status:', backgroundStatus);
          if (backgroundStatus !== 'granted') {
            console.warn('Background location permission not granted - some features may be limited');
          }
        } catch (bgError) {
          console.error('Error requesting background permissions:', bgError);
          // Continue without background permissions
        }
      }

      console.log('Getting current position...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      console.log('Current position obtained:', currentLocation.coords);
      const { latitude, longitude } = currentLocation.coords;

      try {
        // Set up location watcher with appropriate options for each platform
        const watchConfig = {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update when moved 10 meters
        };
        
        // Add foreground service for Android
        if (Platform.OS === 'android') {
          watchConfig.foregroundService = {
            notificationTitle: "Location",
            notificationBody: "Location tracking for prayer times",
            notificationColor: "#053529",
          };
        }
        
        console.log('Setting up location watcher with config:', watchConfig);
        Location.watchPositionAsync(
          watchConfig,
          async (location) => {
            try {
              console.log('Location update received:', location.coords);
              
              // Get city and country through reverse geocoding
              console.log('Performing reverse geocoding...');
              const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              });
              
              console.log('Reverse geocode result:', JSON.stringify(reverseGeocode));
              
              if (reverseGeocode && reverseGeocode.length > 0) {
                const { city, district, subregion, region, country } = reverseGeocode[0];
                // Try multiple fields to get the best city name
                const newCity = city || district || subregion || region || 'Unknown City';
                const newCountry = country || 'Unknown Country';
                
                console.log(`Location resolved to: ${newCity}, ${newCountry}`);
                
                // Get current cached location
                const currentLocation = await this.getCachedLocation();
                
                // If city has changed, update the cache and trigger a refresh
                if (!currentLocation || currentLocation.city !== newCity) {
                  const locationData = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    city: newCity,
                    country: newCountry,
                  };
                  
                  console.log('Caching new location data:', locationData);
                  await this.cacheLocation(locationData);
                  
                  // Notify that location has changed
                  if (global.locationChangeCallback) {
                    console.log('Triggering location change callback');
                    global.locationChangeCallback(locationData);
                  }
                }
              } else {
                console.warn('Reverse geocoding returned empty results');
              }
            } catch (error) {
              console.error('Error in location update:', error);
            }
          }
        );

        // Get initial location data with better error handling for reverse geocoding
        console.log('Getting initial city data through reverse geocoding...');
        const reverseGeocode = await Location.reverseGeocodeAsync({ 
          latitude, 
          longitude 
        });
        
        console.log('Initial reverse geocode result:', JSON.stringify(reverseGeocode));
        
        if (!reverseGeocode || reverseGeocode.length === 0) {
          console.warn('Initial reverse geocoding returned empty results');
          throw new Error('Reverse geocoding failed to return results');
        }
        
        const { city, district, subregion, region, country } = reverseGeocode[0] || {};
        
        // Try multiple fields to get the best city name
        const cityName = city || district || subregion || region || 'Unknown City';
        const countryName = country || 'Unknown Country';
        
        console.log(`Initial location resolved to: ${cityName}, ${countryName}`);

        const locationData = {
          latitude,
          longitude,
          city: cityName,
          country: countryName,
        };

        console.log('Caching initial location data:', locationData);
        await this.cacheLocation(locationData);
        return locationData;
      } catch (error) {
        console.error('Error in reverse geocoding:', error);
        // Still return coordinates even if reverse geocoding fails
        const locationData = {
          latitude,
          longitude,
          city: 'Unknown City',
          country: 'Unknown Country',
        };
        
        console.log('Caching fallback location data:', locationData);
        await this.cacheLocation(locationData);
        return locationData;
      }
    } catch (error) {
      console.error('Error in getUpdatedLocation:', error);
      throw error;
    }
  }

  static async getCachedLocation() {
    try {
      const cachedLatitude = await AsyncStorage.getItem('cachedLatitude');
      const cachedLongitude = await AsyncStorage.getItem('cachedLongitude');
      const cachedCity = await AsyncStorage.getItem('cachedCity');
      const cachedCountry = await AsyncStorage.getItem('cachedCountry');

      if (cachedLatitude && cachedLongitude && cachedCity && cachedCountry) {
        return {
          latitude: parseFloat(cachedLatitude),
          longitude: parseFloat(cachedLongitude),
          city: cachedCity,
          country: cachedCountry,
        };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving cached location:', error);
      return null;
    }
  }

  static setLocationChangeCallback(callback: (location: any) => void) {
    global.locationChangeCallback = callback;
  }

  static async cacheLocation({ latitude, longitude, city, country }) {
    try {
      await AsyncStorage.setItem('cachedLatitude', latitude.toString());
      await AsyncStorage.setItem('cachedLongitude', longitude.toString());
      await AsyncStorage.setItem('cachedCity', city);
      await AsyncStorage.setItem('cachedCountry', country);
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }
}

export default LocationService;
