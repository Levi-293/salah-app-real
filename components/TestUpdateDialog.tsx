import React, { useState } from 'react';
import { View, Button, StyleSheet, Text, Alert, Platform } from 'react-native';
import { checkForUpdates, getAppVersion, getAppVersionName, showUpdateDialog } from '../utils/version';

/**
 * A test component with buttons to trigger the update dialog manually
 */
export const TestUpdateDialog: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  
  // Get current app version info
  const currentVersion = getAppVersionName();
  const buildNumber = getAppVersion();
  
  const handleTestRegularUpdate = async () => {
    // Test regular update (can be dismissed)
    setTestResult('Checking for regular update...');
    
    // Run the check even in development mode, with a dismissible dialog (false)
    // First parameter: ignoreDevMode = true (run even in dev mode)
    // Second parameter: forceUpdate = false (dialog can be dismissed)
    const result = await checkForUpdates(true, false);
    
    // The result will be true if an update is available, false otherwise
    setTestResult(`Regular update check result: ${result ? 'Update available' : 'No update available'}`);
    return result;
  };

  const handleTestForceUpdate = async () => {
    // Test force update (cannot be dismissed)
    setTestResult('Checking for forced update...');
    
    // Run the check even in development mode, with a non-dismissible dialog
    // First parameter: ignoreDevMode = true (run even in dev mode)
    // Second parameter: forceUpdate = true (dialog cannot be dismissed)
    const result = await checkForUpdates(true, true);
    
    setTestResult(`Force update check result: ${result ? 'Update available' : 'No update available'}`);
  };
  
  const handleDirectDialogTest = () => {
    // Directly show the update dialog without checking version
    setTestResult('Showing update dialog directly...');
    
    // Use a sample store URL based on platform
    const storeUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/us/app/salah-guide-app/id6737063241'
      : 'https://play.google.com/store/apps/details?id=com.aburuqayyah.salah';
    
    // Show a regular update dialog (can be dismissed)
    showUpdateDialog(storeUrl, false);
  };
  
  const handleDirectForceDialogTest = () => {
    // Directly show the force update dialog without checking version
    setTestResult('Showing force update dialog directly...');
    
    // Use a sample store URL based on platform
    const storeUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/us/app/salah-guide-app/id6737063241'
      : 'https://play.google.com/store/apps/details?id=com.aburuqayyah.salah';
    
    // Show a force update dialog (cannot be dismissed)
    showUpdateDialog(storeUrl, true);
  };
  
  const handleShowVersionInfo = () => {
    // Show current version information
    Alert.alert(
      'App Version Info',
      `Version Name: ${currentVersion}\nBuild Number: ${buildNumber}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Dialog Test Tool</Text>
      <Text style={styles.version}>Current Version: {currentVersion} (Build {buildNumber})</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Version Check Tests</Text>
        <Button
          title="Test Regular Update Check"
          onPress={handleTestRegularUpdate}
          color="#2196F3"
        />
        <View style={styles.spacer} />
        <Button
          title="Test Force Update Check"
          onPress={handleTestForceUpdate}
          color="#F44336"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Direct Dialog Tests</Text>
        <Button
          title="Show Update Dialog"
          onPress={handleDirectDialogTest}
          color="#4CAF50"
        />
        <View style={styles.spacer} />
        <Button
          title="Show Force Update Dialog"
          onPress={handleDirectForceDialogTest}
          color="#FF9800"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Utilities</Text>
        <Button
          title="Show Version Info"
          onPress={handleShowVersionInfo}
          color="#9C27B0"
        />
      </View>
      
      {testResult ? <Text style={styles.result}>{testResult}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  spacer: {
    height: 12,
  },
  result: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    fontSize: 14,
  },
});

export default TestUpdateDialog;
