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
      // Only ignore dev mode if this is a force update (for testing)
      checkForUpdates(forceUpdate, forceUpdate);
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
  // Only ignore dev mode for forced updates (testing)
  return await checkForUpdates(force, force);
};

export default UpdateChecker;
