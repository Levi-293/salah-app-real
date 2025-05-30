# App Update Checker for Salah Guide

This document explains how to implement and use the app update checker in the Salah Guide app to prompt users to update when a new version is available.

## Overview

The update checker:
- Checks if a newer version of the app is available on the App Store or Google Play Store
- Prompts users to update with a customizable dialog
- Supports both optional and forced updates
- Can be triggered automatically on app start or manually

## Integration Steps

### 1. Add the UpdateChecker Component to Your App Root

Add the `UpdateChecker` component to your app's root component to check for updates when the app starts:

```jsx
// In your App.tsx or root component
import React from 'react';
import { View } from 'react-native';
import UpdateChecker from './components/UpdateChecker';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      {/* Add UpdateChecker at the root level */}
      <UpdateChecker checkOnMount={true} forceUpdate={false} />
      
      {/* Rest of your app */}
      {/* ... */}
    </View>
  );
}
```

### 2. Manually Trigger Update Checks (Optional)

You can also manually trigger update checks from anywhere in your app:

```jsx
import { triggerUpdateCheck } from './components/UpdateChecker';

// In a component or function
const checkForUpdates = async () => {
  const updateAvailable = await triggerUpdateCheck(false);
  if (!updateAvailable) {
    // No update available
    alert('Your app is up to date!');
  }
  // If update is available, the dialog is shown automatically
};

// For critical updates that cannot be dismissed
const forceUpdate = async () => {
  await triggerUpdateCheck(true);
};
```

## API Reference

### UpdateChecker Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `forceUpdate` | boolean | `false` | If true, the user cannot dismiss the update dialog |
| `checkOnMount` | boolean | `true` | If true, check for updates when the component mounts |

### Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `triggerUpdateCheck` | `forceUpdate: boolean = false` | `Promise<boolean>` | Manually checks for updates. Returns true if an update is available |
| `checkForUpdates` | `forceUpdate: boolean = false` | `Promise<boolean>` | Checks if an update is available and shows the dialog if needed |
| `showUpdateDialog` | `storeUrl: string, forceUpdate: boolean = false` | `void` | Shows the update dialog with the provided store URL |

## Implementation Notes

1. The update checker uses the `react-native-version-check` package to compare the current app version with the latest version on the stores.

2. For iOS, it uses the `buildNumber` from your app configuration.

3. For Android, it uses the `versionCode` from your app configuration.

4. Make sure your app's version information is correctly set in `app.json`.

## Customizing the Update Dialog

If you want to customize the update dialog message or appearance, you can modify the `showUpdateDialog` function in `utils/version.ts`.
