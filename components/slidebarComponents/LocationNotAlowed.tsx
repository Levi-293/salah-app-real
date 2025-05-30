import { StyleSheet, View, Text, Alert, Platform, Linking } from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import { useGlobalContext } from '../../context/GlobalProvider';
import StandarButton from '../StandarBtn';
import LocationSvg2 from '../../assets/svg/LocationSvg2';
import { useTheme } from '../../context/ThemeContext';

export default function LocationNotAllowed() {
  const { theme } = useTheme();
  
  const { useSlidebar, setLocationAllowed, setSlidebarActive } = useGlobalContext();
  const handleLocationPermission = async () => {
    try {
      // Request background permission
      const { status } = await Location.requestBackgroundPermissionsAsync();
      
      if (status === 'granted') {
        try {
          if (Platform.OS === 'android') {
            await Location.startLocationUpdatesAsync('location-updates', {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000,
              distanceInterval: 10,
              foregroundService: {
                notificationTitle: "Location",
                notificationBody: "Location tracking for prayer times",
                notificationColor: "#053529",
              }
            });
          }

          setLocationAllowed(true);
          setSlidebarActive(false);
        } catch (taskError) {
          Alert.alert(
            "Task Error",
            `Could not start location updates: ${taskError.message}`
          );
          return;
        }
      } else {
        Alert.alert(
          "Permission Error",
          "Background location access is required"
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        `Could not enable location: ${error.message}`
      );
    }
  };

  return (
    <View>
      <ThemedText style={styles.title}>Turn location Permissions to “Always”</ThemedText>
      <View style={{alignItems:'center'}}>
        <LocationSvg2 fill={Colors[theme].focusColor} />
      </View>
      <ThemedText style={styles.subtitle}>
        Enable location permissions to find your local prayer times & calculate qibla directions. Enable notifications permissions to receive alert. Locations data are fully secure.
      </ThemedText>
      <StandarButton 
        onPress={handleLocationPermission} 
        style={[styles.submitBtn, { backgroundColor: Colors[theme].focusColor }]}
      >
        <Text style={styles.btnText}>Change to “Always”</Text>
      </StandarButton>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 40,
    lineHeight: 16,
    alignItems: 'center',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center'
  },
  submitBtn: {
    marginTop: 60,
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  }
});
