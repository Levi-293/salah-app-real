import { Platform, Linking, Alert } from 'react-native';
import Constants from 'expo-constants';
import VersionCheck from 'react-native-version-check';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Determines if the app is running in development mode
 * @returns true if the app is running in development mode
 */
export const isDevelopmentMode = (): boolean => {
  if (__DEV__) {
    return true;
  }
  
  // Additional check for Expo environment
  if (Constants.expoConfig?.extra?.isDevMode) {
    return true;
  }
  
  return false;
};

export const getAppVersion = () => {
  if (Platform.OS === 'ios') {
    return Constants.expoConfig?.ios?.buildNumber || '49';
  } else if (Platform.OS === 'android') {
    return Constants.expoConfig?.android?.versionCode?.toString() || '50';
  }
  return '50';
};

export const getAppVersionName = () => {
  if (Platform.OS === 'ios') {
    // For iOS, use CFBundleShortVersionString from Info.plist
    return Constants.expoConfig?.version || '1.3.2';
  } else if (Platform.OS === 'android') {
    // For Android, use versionName from build.gradle
    return Constants.expoConfig?.android?.versionName || '1.3.2';
  }
  return Constants.expoConfig?.version || '1.3.2';
};

// Keys for storing update-related information
const LAST_UPDATE_CHECK_KEY = 'last_update_check_timestamp';
const DISMISSED_VERSION_KEY = 'dismissed_update_version';
const DISMISSED_TIME_KEY = 'dismissed_update_timestamp';

// Time constants
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
// Check for updates more frequently (in milliseconds)
const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

/**
 * Checks if an app update is available and prompts the user to update if needed
 * @param ignoreDevMode If true, runs the check even in development mode
 * @param forceUpdate If true, the user cannot dismiss the update prompt
 * @returns Promise that resolves to true if an update is available
 */
export const checkForUpdates = async (ignoreDevMode = false, forceUpdate = false): Promise<boolean> => {
  // In development mode, we'll only run the check if explicitly told to
  const devMode = isDevelopmentMode();
  if (devMode && !ignoreDevMode) {
    console.log('Skipping update check - running in development mode');
    return false;
  }
  
  // Log that we're running the check
  console.log(`Running update check - will perform full version check (${forceUpdate ? 'non-dismissible' : 'dismissible'})`);
  
  // In development mode, we'll use a special test version to simulate updates
  // This allows testing the update dialog without changing the app version
  const testLatestVersion = '1.3.2';
  const testCurrentVersion = getAppVersionName();
  
  // For testing in development mode, we can simulate an update by comparing with a test version
  if (devMode && ignoreDevMode) {
    console.log(`Development mode testing - comparing current version ${testCurrentVersion} with test version ${testLatestVersion}`);
    // Show update dialog if the test version is higher than the current version
    if (compareVersions(testLatestVersion, testCurrentVersion)) {
      console.log('Update available in development mode test');
      // Get the appropriate store URL based on platform
      let storeUrl = '';
      if (Platform.OS === 'ios') {
        storeUrl = 'https://apps.apple.com/us/app/salah-guide-app/id6737063241';
      } else {
        storeUrl = 'https://play.google.com/store/apps/details?id=com.aburuqayyah.salah';
      }
      // Show the update dialog
      showUpdateDialog(storeUrl, forceUpdate);
      return true;
    } else {
      console.log('No update available in development mode test');
      return false;
    }
  }

  try {
    // First check if we're in the middle of handling an update redirect
    let handlingUpdate = null;
    try {
      handlingUpdate = await AsyncStorage.getItem('handling_update_redirect');
    } catch (error) {
      console.log('Error checking handling update redirect:', error);
      // Continue even if this fails
    }
    
    if (handlingUpdate === 'true') {
      // We're already handling an update, clear the flag and skip the check
      try {
        await AsyncStorage.removeItem('handling_update_redirect');
      } catch (error) {
        console.log('Error clearing handling update redirect flag:', error);
        // Continue even if this fails
      }
      console.log('Skipping update check - already handling an update redirect');
      return false;
    }
    
    // Get latest version from store before checking dismissals
    let latestVersion;
    try {
      // For both platforms, use the country code and package name to ensure we get the correct version
      // Use a more aggressive approach to prevent caching
      const timestamp = new Date().getTime();
      // Try multiple approaches to get the latest version
      try {
        if (Platform.OS === 'ios') {
          // For iOS, use a direct iTunes lookup with the App ID
          // The App ID is the numeric part of the App Store URL
          // For example, in https://apps.apple.com/us/app/salah-guide-app/id6737063241, the ID is 6737063241
          const appStoreId = '6737063241'; // Your app's ID in the App Store
          const timestamp = new Date().getTime(); // Add timestamp to prevent caching
          const lookupUrl = `https://itunes.apple.com/lookup?id=${appStoreId}&country=us&t=${timestamp}`;
          
          console.log('Fetching iOS version directly from iTunes API:', lookupUrl);
          
          try {
            const response = await fetch(lookupUrl, {
              method: 'GET', // Explicitly set method
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Timestamp': timestamp.toString() // Add unique header
              }
            });
            
            if (!response.ok) {
              throw new Error(`iTunes API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('iTunes API response:', JSON.stringify(data));
            
            if (data && data.results && data.results.length > 0) {
              latestVersion = data.results[0].version;
              console.log('Successfully retrieved iOS version from iTunes API:', latestVersion);
            } else {
              console.log('No results found in iTunes API response');
            }
          } catch (error) {
            console.error('Error fetching from iTunes API:', error);
          }
        } else {
          // For Android, try multiple approaches with aggressive cache prevention
          const timestamp = new Date().getTime(); // For cache busting
          
          // First, use the standard approach with the library and enhanced cache prevention
          try {
            latestVersion = await VersionCheck.getLatestVersion({
              provider: 'playStore',
              country: 'us',
              packageName: 'com.aburuqayyah.salah',
              fetchOptions: {
                method: 'GET',
                cache: 'no-store',
                headers: {
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                  'Expires': '0',
                  'X-Timestamp': timestamp.toString()
                }
              }
            });
            
            console.log(`First attempt Android version from Play Store:`, latestVersion);
          } catch (error) {
            console.error('Error in first Android version check:', error);
          }
          
          // If that didn't work or returned an incorrect version, try the needUpdate method
          if (!latestVersion) {
            console.log('First Android attempt failed, trying needUpdate method...');
            
            try {
              const result = await VersionCheck.needUpdate({
                currentVersion: getAppVersionName(),
                country: 'us',
                provider: 'playStore',
                fetchOptions: {
                  method: 'GET',
                  cache: 'no-store',
                  headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'X-Timestamp': (timestamp + 1).toString() // Slightly different timestamp
                  }
                }
              });
              
              if (result && result.latestVersion) {
                console.log('Android needUpdate result:', result);
                latestVersion = result.latestVersion;
              }
            } catch (error) {
              console.error('Error in Android needUpdate check:', error);
            }
          }
          
          // Log the final Android version we found
          console.log(`Final Android version from Play Store:`, latestVersion);
        }
        
        // If direct methods failed, try the library's needUpdate as a fallback
        if (!latestVersion) {
          console.log('Direct version check failed, trying alternative method...');
          
          const result = await VersionCheck.needUpdate({
            currentVersion: getAppVersionName(),
            country: 'us',
            provider: Platform.OS === 'ios' ? 'appStore' : 'playStore'
          });
          
          if (result && result.latestVersion) {
            console.log('Alternative method result:', result);
            latestVersion = result.latestVersion;
          }
        }
      } catch (error) {
        console.error('Error in version check process:', error);
        // Continue with the fallback below
      }
      
      // Log the retrieved version for debugging
      console.log(`Raw version from ${Platform.OS} store:`, latestVersion);
      
      // Validate the retrieved version
      if (!latestVersion) {
        console.log(`Failed to retrieve a valid version from ${Platform.OS} store`);
        
        // Use a hardcoded fallback version for testing that is higher than current
        // This ensures update dialog will appear even if store version can't be retrieved
        const currentVersion = getAppVersionName();
        
        // Check if this is the first launch
        const isFirstLaunch = !await AsyncStorage.getItem('first_app_launch');
        
        // Determine the fallback version based on environment and launch status
        let fallbackVersion;
        if (isDevelopmentMode()) {
          // In development mode, always use a high version for testing
          fallbackVersion = '1.3.1';
        } else if (isFirstLaunch) {
          // On first launch in production, use a higher version to ensure dialog appears
          fallbackVersion = incrementVersion(currentVersion);
          console.log(`First launch detected, using higher fallback version: ${fallbackVersion}`);
        } else {
          // On subsequent launches in production, use current version to prevent false prompts
          fallbackVersion = currentVersion;
        }
        
        // Only use fallback if it's higher than current version
        if (compareVersions(fallbackVersion, currentVersion)) {
          console.log(`Using fallback version ${fallbackVersion}`);
          latestVersion = fallbackVersion;
        } else {
          // Otherwise use current version to avoid crashes
          latestVersion = currentVersion;
        }
      }
      
      console.log(`Retrieved ${Platform.OS} version from store:`, latestVersion);
      console.log(`Latest version from store: ${latestVersion}, Current version: ${getAppVersionName()}`);
      
      // Check if this store version was previously dismissed by the user
      let dismissedVersion = null;
      let dismissedTimeStr = null;
      try {
        dismissedVersion = await AsyncStorage.getItem(DISMISSED_VERSION_KEY);
        dismissedTimeStr = await AsyncStorage.getItem(DISMISSED_TIME_KEY);
      } catch (error) {
        console.log('Error getting dismissed version:', error);
        // Continue even if this fails
      }
      
      if (dismissedVersion === latestVersion && !forceUpdate && dismissedTimeStr) {
        // Check if 24 hours have passed since dismissal
        let dismissedTime = null;
        try {
          dismissedTime = parseInt(dismissedTimeStr, 10);
        } catch (error) {
          console.log('Error parsing dismissed time:', error);
          // Continue even if this fails
        }
        
        if (dismissedTime) {
          const now = Date.now();
          const timeSinceDismissal = now - dismissedTime;
          
          if (timeSinceDismissal < ONE_DAY_MS) {
            // Less than 24 hours have passed, respect the dismissal
            console.log(`Skipping update check - user dismissed version ${dismissedVersion} ${Math.round(timeSinceDismissal / (60 * 60 * 1000))} hours ago`);
            return false;
          } else {
            // More than 24 hours have passed, show the dialog again
            console.log(`Showing update dialog again - it's been more than 24 hours since dismissal`);
          }
        }
      }
    } catch (error) {
      console.error('Error getting latest version:', error);
      // Continue with the update check even if there's an error
    }
    
    // Always clear any previous update check timestamp when app opens
    // This ensures we check for updates every time the app is opened
    console.log('Checking for updates on app start');
    
    // Wrap all AsyncStorage operations in try/catch to prevent crashes
    try {
      const now = Date.now();
      
      // Store a flag to track if this is the first launch after install
      let isFirstLaunch = null;
      try {
        isFirstLaunch = await AsyncStorage.getItem('first_app_launch');
      } catch (error) {
        console.log('Error checking first launch:', error);
        // Continue even if this fails
      }
      
      // If this is the first launch, set the flag and continue with update check
      if (!isFirstLaunch) {
        console.log('First app launch detected, setting flag');
        try {
          await AsyncStorage.setItem('first_app_launch', 'completed');
          console.log('First launch flag set successfully');
        } catch (error) {
          console.log('Error setting first launch flag:', error);
          // Continue even if this fails
        }
        console.log('Continuing with update check on first launch');
      }
      
      // Only apply a cooldown to prevent multiple checks in the same session
      let appStartTime = null;
      try {
        appStartTime = await AsyncStorage.getItem('app_start_timestamp');
      } catch (error) {
        console.log('Error getting app start timestamp:', error);
        // Continue even if this fails
      }
      
      if (appStartTime && !forceUpdate) {
        try {
          const startTime = parseInt(appStartTime, 10);
          const timeSinceStart = now - startTime;
          
          // If app started less than 10 seconds ago, skip to prevent double-checks
          if (timeSinceStart < 10000) {
            console.log('Skipping update check - app just started');
            return false;
          }
        } catch (error) {
          console.log('Error parsing timestamp:', error);
          // Continue even if this fails
        }
      }
      
      // Update the app start timestamp
      try {
        await AsyncStorage.setItem('app_start_timestamp', now.toString());
        console.log('App start timestamp updated successfully');
      } catch (error) {
        console.log('Error setting app start timestamp:', error);
        // Continue even if this fails
      }
      
      // Save the current timestamp as the last check time
      try {
        await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, now.toString());
        console.log('Last update check timestamp updated successfully');
      } catch (error) {
        console.log('Error setting last update check timestamp:', error);
        // Continue even if this fails
      }
    } catch (outerError) {
      // Catch any other errors in the AsyncStorage operations
      console.log('Error in AsyncStorage operations:', outerError);
      // Continue with update check even if there are errors
    }
    
    // If we already got the latest version in the dismissal check, use that
    // Otherwise, fetch it now
    if (!latestVersion) {
      try {
        // Fetch the latest version from the store
        latestVersion = await VersionCheck.getLatestVersion({
          provider: Platform.OS === 'ios' ? 'appStore' : 'playStore',
          packageName: 'com.aburuqayyah.salah',
          country: 'us', // Explicitly set country for both platforms
          // Force fetch from the network rather than cache
          fetchOptions: {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        });
        
        // Log the retrieved version for debugging
        console.log(`Retrieved ${Platform.OS} version from store (second attempt):`, latestVersion);
        console.log('Latest version from store:', latestVersion);
      } catch (error) {
        console.error('Error getting latest version:', error);
        return false;
      }
    }
    
    // Get current version
    const currentVersion = getAppVersionName();
    console.log('Current app version:', currentVersion);
    console.log('Store version:', latestVersion);
    
    // Check if we have a valid latestVersion
    if (!latestVersion) {
      console.log('No valid version retrieved from store, skipping version check');
      return false;
    }
    
    console.log('Versions match?', latestVersion === currentVersion);
    
    // Compare versions to check if an update is needed
    console.log('Version comparison:', { currentVersion, latestVersion });
    
    // Parse versions for comparison
    const currentParts = currentVersion.split('.').map(Number);
    const latestParts = latestVersion.split('.').map(Number);
    
    // Initialize update needed flag
    let needsUpdateByParts = false;
    
    // Compare versions to check if an update is needed
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const current = currentParts[i] || 0;
      const latest = latestParts[i] || 0;
      if (latest > current) {
        console.log(`Update needed: ${latestVersion} is newer than ${currentVersion}`);
        needsUpdateByParts = true;
        break;
      } else if (current > latest) {
        console.log(`No update needed: ${currentVersion} is newer than ${latestVersion}`);
        needsUpdateByParts = false;
        break;
      }
    }
    
    // If versions are identical, log it
    if (!needsUpdateByParts) {
      console.log('App is up to date - versions are identical');
    }
    
    // Manual version comparison as a backup in case the direct comparison fails
    // This helps especially on Android where sometimes the version check can be unreliable
    const manualNeedsUpdate = compareVersions(latestVersion, currentVersion);
    console.log('Manual version comparison result:', manualNeedsUpdate);
    
    try {
      // Compare versions and show update dialog if needed
      // Get the store URL based on platform - use direct URLs for reliability
      let storeUrl = '';
      
      if (Platform.OS === 'ios') {
        storeUrl = 'https://apps.apple.com/us/app/salah-guide-app/id6737063241';
      } else {
        storeUrl = 'https://play.google.com/store/apps/details?id=com.aburuqayyah.salah';
      }
      
      console.log('Using store URL for version check:', storeUrl);
      
      // Call needUpdate with the store URL
      const needsUpdate = await VersionCheck.needUpdate({
        currentVersion,
        latestVersion,
        storeUrl
      });
      
      // Ensure the store URL is set in the response
      if (needsUpdate && !needsUpdate.storeUrl) {
        console.log('Store URL not set in needUpdate response, adding it manually');
        needsUpdate.storeUrl = storeUrl;
      }
      
      console.log('Update check result from library:', needsUpdate);
      
      // Log all update check results for debugging
      console.log('Update check results:', {
        directComparison: needsUpdateByParts,
        manualComparison: manualNeedsUpdate,
        libraryCheck: needsUpdate && needsUpdate.isNeeded
      });
      
      // Standard version comparison - show update dialog only when there's a newer version
      // This is the standard behavior for version checking
      
      // Show update dialog if ANY method indicates an update is needed
      // This provides triple redundancy to ensure updates are detected
      const updateNeeded = needsUpdateByParts || manualNeedsUpdate || (needsUpdate && needsUpdate.isNeeded);
      
      console.log('Final update decision:', updateNeeded ? 'Update needed' : 'No update needed');
      
      if (updateNeeded) {
        console.log('Using store URL:', storeUrl);
        
        // Show update dialog
        showUpdateDialog(storeUrl, forceUpdate);
        return true;
      } else {
        console.log('App is up to date');
        return false;
      }
    } catch (error) {
      console.error('Error in version comparison:', error);
      return false;
    }
  } catch (error) {
    console.error('Error in update check process:', error);
    return false;
  }
};

/**
 * Determines if enough time has passed since the last update check
 * @returns Promise that resolves to true if we should check for updates
 */
async function shouldCheckForUpdates(): Promise<boolean> {
  try {
    let lastCheckTimestamp = null;
    try {
      lastCheckTimestamp = await AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);
    } catch (error) {
      console.log('Error checking last update timestamp:', error);
      return true; // If there's an error, default to checking for updates
    }
    
    if (!lastCheckTimestamp) {
      return true; // No record of previous check, so we should check
    }
    
    let lastCheck = null;
    try {
      lastCheck = parseInt(lastCheckTimestamp, 10);
    } catch (error) {
      console.log('Error parsing timestamp:', error);
      return true; // If there's an error, default to checking for updates
    }
    
    if (!lastCheck) {
      return true; // Invalid timestamp, so check for updates
    }
    
    const now = Date.now();
    
    // Check if enough time has passed since the last check
    return (now - lastCheck) > UPDATE_CHECK_INTERVAL;
  } catch (error) {
    console.error('Error checking last update timestamp:', error);
    return true; // If there's an error, default to checking for updates
  }
};

/**
 * Compare two version strings to determine if an update is needed
 * @param latestVersion The latest version from the store
 * @param currentVersion The current app version
 * @returns true if the latest version is greater than the current version
 */
function compareVersions(latestVersion: string, currentVersion: string): boolean {
  try {
    // Validate inputs
    if (!latestVersion || !currentVersion) {
      console.log('Invalid version strings for comparison:', { latestVersion, currentVersion });
      return false;
    }
    
    // Ensure versions are trimmed
    latestVersion = latestVersion.trim();
    currentVersion = currentVersion.trim();
    
    // Log the versions being compared
    console.log(`Comparing versions - Latest: "${latestVersion}", Current: "${currentVersion}"`);
    
    // Split version strings into components (e.g., "1.3.1" -> [1, 2, 3])
    const latest = latestVersion.split('.').map(Number);
    const current = currentVersion.split('.').map(Number);
    
    // Validate parsed versions
    if (latest.some(isNaN) || current.some(isNaN)) {
      console.log('Invalid version format detected:', { latest, current });
      return false;
    }
    
    // Ensure both arrays have the same length by padding with zeros
    const maxLength = Math.max(latest.length, current.length);
    while (latest.length < maxLength) latest.push(0);
    while (current.length < maxLength) current.push(0);
    
    // Compare each component
    for (let i = 0; i < maxLength; i++) {
      if (latest[i] > current[i]) {
        console.log(`Update needed: component ${i+1} is newer (${latest[i]} > ${current[i]})`);
        return true;
      }
      if (latest[i] < current[i]) {
        console.log(`No update needed: component ${i+1} is older (${latest[i]} < ${current[i]})`);
        return false;
      }
    }
    
    // If we get here, versions are exactly equal
    console.log('Versions are identical');
    return false;
  } catch (error) {
    console.error('Error comparing versions:', error);
    // Default to no update needed if there's an error in comparison
    return false;
  }
};

/**
 * Shows a dialog prompting the user to update the app
 * @param storeUrl URL to the app store
 * @param forceUpdate If true, the user cannot dismiss the update dialog
 */
export const showUpdateDialog = (storeUrl: string, forceUpdate = false) => {
  const title = 'Update Available';
  const message = 'A new version of Salah Guide is available. Please update to the latest version for improved features and bug fixes.';
  
  // Function to handle opening the store URL properly
  const handleOpenStore = () => {
    // Fallback URLs in case the provided URL is empty
    let finalStoreUrl = storeUrl;
    if (!finalStoreUrl || finalStoreUrl.trim() === '') {
      console.log('Store URL is empty, using fallback URL');
      if (Platform.OS === 'ios') {
        finalStoreUrl = 'https://apps.apple.com/us/app/salah-guide-app/id6737063241';
      } else {
        finalStoreUrl = 'https://play.google.com/store/apps/details?id=com.aburuqayyah.salah';
      }
    }

    // Store the fact that we're handling an update to prevent duplicate prompts
    AsyncStorage.setItem('handling_update_redirect', 'true')
      .then(() => {
        if (Platform.OS === 'android') {
          // On Android, we need to add a slight delay to ensure the flag is saved
          // before the app potentially gets backgrounded
          setTimeout(() => {
            Linking.openURL(finalStoreUrl).catch(err => {
              console.error('Error opening store URL:', err);
              // Clear the handling flag if there was an error
              AsyncStorage.removeItem('handling_update_redirect');
            });
          }, 300);
        } else {
          // iOS handling
          Linking.openURL(finalStoreUrl).catch(err => {
            console.error('Error opening store URL:', err);
            // Clear the handling flag if there was an error
            AsyncStorage.removeItem('handling_update_redirect');
          });
        }
      })
      .catch(err => {
        console.error('Error setting update redirect flag:', err);
      });
  };
  
  if (forceUpdate) {
    // Force update dialog (cannot be dismissed)
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Update Now',
          onPress: handleOpenStore
        }
      ],
      { cancelable: false }
    );
  } else {
    // Regular update dialog (can be dismissed)
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => {
            // Mark this version as dismissed to avoid showing again too soon
            dismissUpdate(getAppVersionName());
          }
        },
        {
          text: 'Update',
          onPress: handleOpenStore
        }
      ]
    );
  }
};

/**
 * Stores information about dismissed updates to avoid showing the same update repeatedly
 * Will show the update dialog again after 24 hours
 * @param version The version that was dismissed
 */
/**
 * Increments a version string by adding 0.0.1 to the last component
 * @param version The version string to increment (e.g., '1.2.3')
 * @returns The incremented version string (e.g., '1.2.4')
 */
export const incrementVersion = (version: string): string => {
  try {
    const parts = version.split('.').map(Number);
    
    // Ensure we have at least 3 parts (major.minor.patch)
    while (parts.length < 3) {
      parts.push(0);
    }
    
    // Increment the last part (patch version)
    parts[parts.length - 1] += 1;
    
    return parts.join('.');
  } catch (error) {
    console.error('Error incrementing version:', error);
    // Return a safe fallback if something goes wrong
    return `${version}.1`;
  }
};

export const dismissUpdate = async (version: string): Promise<void> => {
  try {
    // Store the dismissed version and timestamp
    const now = Date.now();
    
    try {
      await AsyncStorage.setItem(DISMISSED_VERSION_KEY, version);
      console.log(`Dismissed version ${version} saved successfully`);
    } catch (error) {
      console.log('Error saving dismissed version:', error);
    }
    
    try {
      await AsyncStorage.setItem(DISMISSED_TIME_KEY, now.toString());
      console.log(`Dismissed timestamp saved successfully`);
    } catch (error) {
      console.log('Error saving dismissed timestamp:', error);
    }
    
    console.log(`User dismissed update to version ${version}`);
  } catch (error) {
    console.error('Error dismissing update:', error);
  }
};