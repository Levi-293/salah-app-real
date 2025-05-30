import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import UpdateChecker, { triggerUpdateCheck } from '../components/UpdateChecker';

/**
 * Example showing how to use the UpdateChecker component
 * 
 * This demonstrates:
 * 1. Automatic update checking on app start
 * 2. Manual update checking when a button is pressed
 */
const UpdateCheckerExample: React.FC = () => {
  // Handle manual update check
  const handleCheckForUpdates = async () => {
    const updateAvailable = await triggerUpdateCheck(false);
    if (!updateAvailable) {
      // No update available, show a message
      alert('Your app is up to date!');
    }
    // If update is available, the dialog is shown automatically
  };

  // Handle force update check (user cannot dismiss)
  const handleForceUpdateCheck = async () => {
    await triggerUpdateCheck(true);
  };

  return (
    <View style={styles.container}>
      {/* Include the UpdateChecker component at the root level */}
      <UpdateChecker checkOnMount={true} forceUpdate={false} />
      
      <Text style={styles.title}>App Update Example</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Check for Updates" 
          onPress={handleCheckForUpdates} 
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Force Update Check" 
          onPress={handleForceUpdateCheck} 
        />
      </View>
      
      <Text style={styles.note}>
        Note: The UpdateChecker component doesn't render anything visible.
        It runs in the background to check for updates when the app starts.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
  },
  note: {
    marginTop: 30,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});

export default UpdateCheckerExample;
