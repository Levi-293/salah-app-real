import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import PlayerConfigSvg from '../../assets/svg/PlayerConfigSvg';
import ConfigNotificationSvg from '../../assets/svg/ConfigNotificationSvg';
import ThemesConfigSvg from '../../assets/svg/ThemesConfigSvg';
import OtherConfigSvg from '../../assets/svg/OtherConfigSvg';
import ReportConfigSvg from '../../assets/svg/ReportConfigSvg';
import PrivacyConfigSvg from '../../assets/svg/PrivacyConfigSvg';

import { Share } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../../context/GlobalProvider';
import { getAppVersionName, triggerUpdateCheck } from '../../utils/version';
import TestUpdateDialog from '../../components/TestUpdateDialog';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { useSlidebar, setSlidebarSelected } = useGlobalContext();
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const configOptions = [
    { icon: <PlayerConfigSvg fill={Colors[theme].configSvg} />, title: 'Prayer Times' },
    { icon: <ConfigNotificationSvg fill={Colors[theme].configSvg} />, title: 'Notifications' },
    { icon: <ThemesConfigSvg fill={Colors[theme].configSvg} />, title: 'Themes' },
    { icon: <OtherConfigSvg fill={Colors[theme].configSvg} />, title: 'Other' },
    {
      icon: <ReportConfigSvg fill={Colors[theme].configSvg} />,
      title: 'Report Issue',
      subtitle: 'Salah is an ad-free prayer app, created by Muslims with a strong emphasis on privacy. Support the free version of the Salah app and be part of the reward.',
      button: 'Report issue',
    },
    { icon: <PrivacyConfigSvg fill={Colors[theme].configSvg} />, title: 'Privacy Policy' }
  ];

  const toggleExpand = (index: number) => {
    if (index == 4) {
      setExpandedItem(expandedItem === index ? null : index);
    } else {
      const option = configOptions[index];
      useSlidebar(); 
      setSlidebarSelected(option.title);
    }
  };

  const onPressReportIssue = () => {
    useSlidebar();
    setSlidebarSelected('Report Issue');
  };

  const sharePressed = () => {
    Share.share({
      message: 
        `Salam! 
        
  Check out this prayer app! It offers:
  
  - Prayer times
  - Step-by-step prayer guide
  - Reminders 
  - And much more!
  
  Download it here:
  
  Android: https://play.google.com/store/apps/details?id=com.aburuqayyah.salah
  
  iOS: https://apps.apple.com/us/app/salah-guide-app/id6737063241`,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <ThemedView style={styles.content}>
        <View style={styles.mainTitle}>
          <ThemedText type='title'>Settings</ThemedText>
        </View>
        <ScrollView style={styles.mainCont}>
          {/* Comprehensive Update Dialog Test Tool */}
          {__DEV__ && (
            <View style={{ marginBottom: 10 }}>
              <TestUpdateDialog />
            </View>
          )}
          <TouchableOpacity onPress={() => sharePressed()}>
            <View style={[styles.shareRewardSection, { backgroundColor: Colors[theme].opacityBtn }]}>
              <ThemedText style={styles.shareRewardTitle}>Share The Reward</ThemedText>
              <ThemedText style={styles.shareRewardQuote}>
                "Whoever guides someone to goodness will have a reward like one who did it." [Muslim 1893]
              </ThemedText>
              <Ionicons name="share-outline" size={24} color={Colors[theme].focusColor} style={styles.shareRewardIcon} />
            </View>
          </TouchableOpacity>
          <View style={[styles.menuSection, { backgroundColor: Colors[theme].opacityBtn }]}>
            {configOptions.map((option, index) => (
              <View key={index}>
                <TouchableOpacity onPress={() => toggleExpand(index)} style={styles.menuItem}>
                  <View style={styles.menuItemContent}>
                    {option.icon}
                    <ThemedText style={styles.menuItemTitle}>{option.title}</ThemedText>
                  </View>
                  <Ionicons 
                    name={expandedItem === index && option.subtitle ? "chevron-down" : "chevron-forward"}
                    size={24} 
                    color={Colors[theme].text} 
                  />
                </TouchableOpacity>
                {expandedItem === index && option.subtitle && (
                  <View style={styles.expandedContent}>
                    <ThemedText style={styles.subtitle}>{option.subtitle}</ThemedText>
                    {option.button && (
                      <TouchableOpacity onPress={() => onPressReportIssue() } style={[styles.button, { backgroundColor: Colors[theme].focusColor }]}>
                        <ThemedText style={styles.buttonText}>{option.button}</ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
          <ThemedText type='littleText' style={{ textAlign: 'center', color: Colors[theme].focusColor, paddingTop: 8 }}>
            Salah Guide v{getAppVersionName()}
          </ThemedText>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  mainTitle: {
    paddingTop: 12,
    paddingHorizontal: 16,
    marginBottom: 23,
  },
  mainCont: {
    padding: 16,
    paddingTop: 0,
  },
  shareRewardSection: {
    backgroundColor: 'rgba(20, 177, 127, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  shareRewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shareRewardQuote: {
    fontSize: 14,
    fontStyle: 'italic',
    width: '80%',
  },
  shareRewardIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  menuSection: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    marginLeft: 16,
    fontSize: 16,
  },
  expandedContent: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  subtitle: {
    marginBottom: 8,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});