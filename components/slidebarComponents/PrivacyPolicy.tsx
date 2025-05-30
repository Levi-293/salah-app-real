import { StyleSheet, View, Text, ScrollView, Linking } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import { useTheme } from '../../context/ThemeContext';

export default function PrivacyPolicy() {
  const { theme } = useTheme();
  const opacityText = theme === 'light' ? 0.7 : 0.7;

  return (
    <View>
      <Text style={[{ color: Colors[theme].focusColor }, styles.textSelected]}>Settings</Text>
      <ThemedText style={styles.title}>Privacy Policy</ThemedText>
      <ThemedText style={styles.subtitle}>At Salah Guide, we respect your privacy. This policy outlines how we handle and protect your data.</ThemedText>
      <ThemedText style={styles.subtitle}>Last updated: October 2024</ThemedText>
      <ScrollView style={[{ opacity: opacityText, maxHeight: 520 }]}>
        <ThemedText style={styles.optionText}>
          About Us
        </ThemedText>
        <ThemedText style={styles.optionText}>
          We are Salah Guide, the developers of the Salah Guide App. If you have any questions regarding this policy or your data, please contact us at{' '}
          <Text style={{ color: 'orange' }} onPress={() => Linking.openURL('mailto:support@salahguideapp.com')}>
            support@salahguideapp.com
          </Text>.
        </ThemedText>
        <ThemedText style={styles.optionText}>
          What This Policy Covers
        </ThemedText>
        <ThemedText style={styles.optionText}>
          This policy applies to the Salah Guide app v1.x. Future versions may introduce new features that require updates to our privacy practices. When this happens, we’ll ask you to review and accept the updated privacy policy.
        </ThemedText>
        <ThemedText style={styles.optionText}>
          We Don’t Collect Personal Data
        </ThemedText>
        <ThemedText style={styles.optionText}>
          Salah Guide is designed to function without collecting any personally identifiable information (PII). Your privacy is paramount to us, and we do not store, transmit, or access any personal data, including your location.
        </ThemedText>
        <ThemedText style={styles.optionText}>
          Location Data for Prayer Time Calculation
        </ThemedText>
        <ThemedText style={styles.optionText}>
          To provide accurate prayer times based on your location, the app processes your location data locally on your device. This data is not shared with us or stored on our servers.
        </ThemedText>
        <ThemedText style={styles.optionText}>
          Email Data (Optional)
        </ThemedText>
        <ThemedText style={styles.optionText}>
          If you sign up for our mailing list or premium features, we will collect your email address to manage your subscription and send updates. We may track whether emails are opened or if links are clicked to improve our services. You can opt out at any time.
        </ThemedText>
        <ThemedText style={styles.optionText}>
          No Data Analytics on the App
        </ThemedText>
        <ThemedText style={styles.optionText}>
          Salah Guide does not track or analyze user behavior within the app. We believe in providing a private and ad-free experience. However, we use Google Analytics for our website to understand how users interact with it. While Google Analytics collects some data, it does not track individual users in a personally identifiable way. You can review Google’s privacy practices{' '}
          <Text style={{ color: 'orange' }} onPress={() => Linking.openURL('https://support.google.com/analytics/answer/6004245')}>
            here
          </Text>.
        </ThemedText>
        <ThemedText style={styles.optionText}>
          Data Retention
        </ThemedText>
        <ThemedText style={styles.optionText}>
          We retain email addresses only as long as necessary for the purposes of communication. If you wish to unsubscribe or have your data deleted, please contact us at{' '}
          <Text style={{ color: 'orange' }} onPress={() => Linking.openURL('mailto:support@salahguideapp.com')}>
            support@salahguideapp.com
          </Text>.
        </ThemedText>
        <ThemedText style={styles.optionText}>
          Your Rights
        </ThemedText>
        <ThemedText style={styles.optionText}>
          Under applicable data protection regulations, you have the right to:

          - Access and request a copy of your data
          - Correct any inaccuracies in your data
          - Request deletion of your data
          - Restrict or object to the processing of your data

          To exercise these rights, email us at{' '}
          <Text style={{ color: 'orange' }} onPress={() => Linking.openURL('mailto:support@salahguideapp.com')}>
            support@salahguideapp.com
          </Text>.
        </ThemedText>
        <ThemedText style={styles.optionText}>
          Changes to This Policy
        </ThemedText>
        <ThemedText style={styles.optionText}>
          We may update this policy from time to time to reflect changes in our practices or new features. Any changes will be posted on our website, and you may be asked to review the updated policy in the app.
        </ThemedText>
        <ThemedText style={styles.optionText}>
          Contact Information
        </ThemedText>
        <ThemedText style={styles.optionText}>
          For any questions about this privacy policy, or if you wish to file a complaint, please email us at{' '}
          <Text style={{ color: 'orange' }} onPress={() => Linking.openURL('mailto:support@salahguideapp.com')}>
            support@salahguideapp.com
          </Text>.
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 16,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.6,
    marginBottom: 8,
  },
  textSelected: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 4,
  },
});
