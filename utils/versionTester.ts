import { Alert, Platform } from 'react-native';
import VersionCheck from 'react-native-version-check';
import { showUpdateDialog } from './version';

/**
 * Test utility for the app update checker
 * This simulates different version scenarios to test the update checker
 */

/**
 * Simulates an available update by mocking the version check
 * @param forceUpdate If true, the user cannot dismiss the update dialog
 */
export const simulateAvailableUpdate = (forceUpdate = false) => {
  // Mock store URL based on platform
  const storeUrl = Platform.select({
    ios: 'https://apps.apple.com/us/app/salah-guide-app/id6737063241',
    android: 'https://play.google.com/store/apps/details?id=com.aburuqayyah.salah',
    default: 'https://salahguide.app'
  });

  // Show the update dialog with the mocked store URL
  showUpdateDialog(storeUrl, forceUpdate);
  
  return true;
};

/**
 * Simulates a scenario where no update is available
 */
export const simulateNoUpdate = () => {
  Alert.alert(
    'App is Up to Date',
    'You are using the latest version of Salah Guide.',
    [{ text: 'OK' }]
  );
  
  return false;
};

/**
 * Simulates an error in the update check process
 */
export const simulateUpdateCheckError = () => {
  Alert.alert(
    'Update Check Failed',
    'Could not check for updates. Please make sure you have an internet connection and try again.',
    [{ text: 'OK' }]
  );
  
  return false;
};

/**
 * Force the update dialog to appear for testing purposes
 * This bypasses all checks and directly shows the dialog
 * @param forceUpdate If true, the user cannot dismiss the dialog
 */
export const forceUpdateDialog = async (forceUpdate = false) => {
  // Get the appropriate store URL
  const storeUrl = Platform.OS === 'ios' 
    ? 'https://apps.apple.com/us/app/salah-guide-app/id6737063241'
    : 'https://play.google.com/store/apps/details?id=com.aburuqayyah.salah';
  
  // Show the update dialog directly
  showUpdateDialog(storeUrl, forceUpdate);
  
  return true;
};

/**
 * Test function that allows you to choose which scenario to simulate
 */
export const testUpdateChecker = () => {
  Alert.alert(
    'Test Update Checker',
    'Choose a scenario to test:',
    [
      {
        text: 'Update Available (Optional)',
        onPress: () => simulateAvailableUpdate(false)
      },
      {
        text: 'Update Available (Forced)',
        onPress: () => simulateAvailableUpdate(true)
      },
      {
        text: 'No Update Available',
        onPress: () => simulateNoUpdate()
      },
      {
        text: 'Update Check Error',
        onPress: () => simulateUpdateCheckError()
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ]
  );
};
