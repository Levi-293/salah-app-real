import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

import App from './App';

// Add error boundary for the entire app
Sentry.init({
  enableNative: true, // Enable native crash reporting
  enableNativeCrashHandling: true,
  // Add specific handling for JavaScriptModuleObject.emitEvent errors
  beforeSend: (event) => {
    // Filter out the specific NullPointerException we're targeting
    if (Platform.OS === 'android' && 
        event.exception?.values?.some(ex => 
          ex.type === 'NullPointerException' && 
          ex.value?.includes('JavaScriptModuleObject') && 
          ex.value?.includes('emitEvent')
        )) {
      console.log('Intercepted JavaScriptModuleObject.emitEvent NullPointerException');
      // Still log it to Sentry but with a custom fingerprint
      event.fingerprint = ['android-jni-bridge-nullpointer'];
      event.level = 'warning'; // Downgrade from fatal to warning
    }
    return event;
  },
});

// Patch the native module system to prevent NullPointerExceptions
if (Platform.OS === 'android') {
  // Safety wrapper for event emitters
  const originalEmit = global.nativeModuleProxy?.emit;
  if (originalEmit) {
    global.nativeModuleProxy.emit = function safeEmit(...args) {
      try {
        return originalEmit.apply(this, args);
      } catch (error) {
        console.log('Prevented crash in native module event emission:', error);
        return undefined;
      }
    };
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
