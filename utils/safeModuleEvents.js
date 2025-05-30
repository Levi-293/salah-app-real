/**
 * Safe Module Events - Prevents NullPointerException in JavaScriptModuleObject.emitEvent
 * 
 * This utility provides a safe wrapper for Expo/React Native module event handling
 * to prevent crashes when events are emitted during app state transitions or
 * when the JavaScript context isn't fully initialized.
 */

import { AppState } from 'react-native';
import * as Sentry from '@sentry/react-native';

// Track app state to know when it's safe to process events
let currentAppState = AppState.currentState;
let isAppActive = currentAppState === 'active';

// Update app state tracking
AppState.addEventListener('change', (nextAppState) => {
  currentAppState = nextAppState;
  isAppActive = currentAppState === 'active';
});

/**
 * Wraps a module's event handler to prevent NullPointerExceptions
 * 
 * @param {Function} handler - The original event handler
 * @param {Object} options - Configuration options
 * @param {boolean} options.logErrors - Whether to log errors to Sentry
 * @param {boolean} options.requireActive - Whether to only process events when app is active
 * @param {Function} options.fallback - Fallback function to call if handler fails
 * @returns {Function} - Safe event handler
 */
export const safeEventHandler = (handler, options = {}) => {
  const { 
    logErrors = true, 
    requireActive = true,
    fallback = null
  } = options;
  
  return (...args) => {
    try {
      // Skip event handling if app isn't active and we require it to be
      if (requireActive && !isAppActive) {
        console.log('Skipping event handler - app not active');
        return fallback ? fallback(...args) : undefined;
      }
      
      // Call the original handler
      return handler(...args);
    } catch (error) {
      // Log the error
      console.error('Error in event handler:', error);
      
      // Report to Sentry if enabled
      if (logErrors) {
        Sentry.captureException(error, {
          tags: {
            module: 'safeEventHandler',
            appState: currentAppState
          },
          extra: {
            arguments: JSON.stringify(args)
          }
        });
      }
      
      // Call fallback if provided
      return fallback ? fallback(...args) : undefined;
    }
  };
};

/**
 * Creates a safe event emitter that won't crash if the JS context is null
 * 
 * @param {Object} emitter - The original event emitter
 * @returns {Object} - Safe event emitter
 */
export const createSafeEmitter = (emitter) => {
  const safeEmitter = {};
  
  // Wrap emit method
  if (emitter.emit) {
    safeEmitter.emit = safeEventHandler(
      (...args) => emitter.emit(...args),
      { requireActive: false }
    );
  }
  
  // Wrap addListener method to use safe handlers
  if (emitter.addListener) {
    safeEmitter.addListener = (eventName, handler) => {
      const safeHandler = safeEventHandler(handler);
      return emitter.addListener(eventName, safeHandler);
    };
  }
  
  return safeEmitter;
};

export default {
  safeEventHandler,
  createSafeEmitter
};
