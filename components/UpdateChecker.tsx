import React, { useEffect } from 'react';
import { checkForUpdates } from '../utils/version';

interface UpdateCheckerProps {
  /**
   * If true, the user cannot dismiss the update dialog
   * Use this for critical updates only
   */
  forceUpdate?: boolean;
  
  /**
   * If true, check for updates immediately when component mounts
   * Default is true
   */
  checkOnMount?: boolean;
}

/**
 * Component that checks for app updates
 * Place this in your app's root component to check for updates on app start
 */
export const UpdateChecker: React.FC<UpdateCheckerProps> = ({
  forceUpdate = false,
  checkOnMount = true,
}) => {
  useEffect(() => {
    if (checkOnMount) {
      // Pass true to ignoreDevMode parameter to check for updates even in development mode
      // This will allow testing the update dialog in development
      checkForUpdates(true, forceUpdate);
    }
  }, [checkOnMount, forceUpdate]);

  // This is a utility component that doesn't render anything
  return null;
};

/**
 * Manually trigger an update check
 * Update dialog will always be dismissible
 */
export const triggerUpdateCheck = async (force = false) => {
  // Always ignore dev mode (true as first parameter)
  return await checkForUpdates(true, force);
};

export default UpdateChecker;
