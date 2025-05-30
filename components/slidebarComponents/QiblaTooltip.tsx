import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import { useTheme } from '../../context/ThemeContext';

export default function QiblaTooltip() {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.tint,
      marginBottom: 16,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      backgroundColor: colors.opacityBtn,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    bulletPoint: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
    },
  });

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>How to Use the Compass</ThemedText>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Calibrate the Compass</ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Before using the compass, ensure it's calibrated for the most accurate reading.
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • To calibrate, hold your phone and move it in a figure-eight motion for a few seconds. This will help the compass read the direction correctly.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Hold Your Phone Flat</ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Place your phone flat in your hand, parallel to the ground.
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Holding the phone at an angle may cause the compass to give inaccurate readings.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Avoid Magnetic Interference</ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Keep your phone away from any magnetic objects (like metal or electronic devices) that might affect the compass's accuracy.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Follow On-Screen Guidance</ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Use the on-screen arrows or instructions, such as "Turn Left" or "Turn Right", to align with the desired direction.
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • When the compass is correctly aligned with Makkah, you'll see a message: "You are facing Makkah."
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Enjoy the Feedback</ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Feel the subtle vibrations when turning your phone, with stronger feedback when the compass accurately points towards Makkah.
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}