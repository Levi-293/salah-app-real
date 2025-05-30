import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import { PrayerInstructionData } from '../components/services/FirebaseService';
import { useGlobalContext } from '../context/GlobalProvider';
import { useAudio } from '../context/AudioContext';

export default function PrayerListScreen() {
  const { theme } = useTheme();
  const { madhabCategories } = useGlobalContext();
  const navigation = useNavigation();
  const router = useRouter();
  const { categoryId, categoryName, comingSoon } = useLocalSearchParams();
  const [activeMadhab, setActiveMadhab] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const { stopPlayingSound } = useAudio();

  const isCategoryComingSoon = comingSoon === 'true';

  useFocusEffect(
    useCallback(() => {
      stopPlayingSound();
    }, [stopPlayingSound])
  );
  
  useEffect(() => {
    const screenWidth = Dimensions.get('window').width;
    if (scrollViewRef.current && contentWidth < screenWidth) {
      const scrollToX = (screenWidth - contentWidth) / 2;
      scrollViewRef.current.scrollTo({ x: -scrollToX, animated: false });
    }
  }, [contentWidth]);

  const filteredPrayers = madhabCategories[activeMadhab].prayers.filter((prayer) => prayer.categoryId === categoryId);

  const handlePrayerPress = (prayer: PrayerInstructionData) => {
    if (prayer.coming_soon) {
      Alert.alert(
        'Coming Soon', // Custom title
        'We\'re working hard to bring you the best possible experience, insha Allah.' // Message
      );
      return;
    }
    router.push({
      pathname: '/instruction_detail',
      params: {
        prayerInstruction: JSON.stringify(prayer),
        madhabName: madhabCategories[activeMadhab].name,
        categoryName: categoryName as string
      }
    });
  };

  const renderPrayer = ({ item }: { item: PrayerInstructionData }) => (
    <TouchableOpacity 
      style={[styles.prayerItem, item.coming_soon && styles.comingSoonItem]}
      onPress={() => handlePrayerPress(item)}
    >
      <View style={styles.prayerItemContent}>
        <View style={styles.prayerTitleContainer}>
          <ThemedText style={[styles.prayerTitle, item.coming_soon && styles.comingSoonText]}>
            {item.title}
          </ThemedText>
          {item.coming_soon && (
            <View style={styles.comingSoonBadge}>
              <Ionicons name="time-outline" size={12} color={Colors[theme].background} />
              <ThemedText style={styles.comingSoonBadgeText}>Coming Soon</ThemedText>
            </View>
          )}
        </View>
      </View>
      <Ionicons 
        name={item.coming_soon ? "time-outline" : "chevron-forward"} 
        size={24} 
        color={Colors[theme].tint} 
      />
    </TouchableOpacity>
  );

  const renderComingSoonCategory = () => (
    <View style={styles.comingSoonContainer}>
      <View style={styles.comingSoonIconContainer}>
        <Ionicons name="hourglass-outline" size={80} color={Colors[theme].tint} />
      </View>
      <ThemedText style={styles.comingSoonCategoryTitle}>Coming Soon</ThemedText>
      <ThemedText style={styles.comingSoonCategoryText}>
        We're working hard to bring you amazing content for {categoryName}.
        Stay tuned for updates!
      </ThemedText>
      <TouchableOpacity style={styles.notifyButton} onPress={() => alert('Notification preference saved!')}>
        <ThemedText style={styles.notifyButtonText}>Notify Me</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (isCategoryComingSoon) {
      return renderComingSoonCategory();
    }

    if (madhabCategories.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors[theme].text} />
        </View>
      );
    }

    return (
      <>
        <View style={styles.tabContainer}>
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContentContainer}
          >
            <View 
              style={styles.tabsWrapper}
              onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setContentWidth(width);
              }}
            >
              {madhabCategories.map((madhab, index) => (
                <TouchableOpacity
                  key={madhab.id}
                  style={[
                    styles.tab,
                    activeMadhab === index && styles.activeTab,
                  ]}
                  onPress={() => setActiveMadhab(index)}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeMadhab === index && styles.activeTabText,
                    ]}
                  >
                    {madhab.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        <View style={styles.contentContainer}>
          {filteredPrayers.length > 0 ? (
            <FlatList
              data={filteredPrayers}
              renderItem={renderPrayer}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                No prayers found for this category.
              </ThemedText>
            </View>
          )}
        </View>
      </>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: categoryName as string,
          headerStyle: {
            backgroundColor: Colors[theme].background,
          },
          headerTintColor: Colors[theme].text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
            </TouchableOpacity>
          ),
        }}
      />
      {renderContent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  tabsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 14,
  },
  activeTabText: {
    color: Colors.light.tint,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  prayerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerItemContent: {
    flex: 1,
  },
  prayerTitleContainer: {
    flex: 1,
  },
  prayerTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  comingSoonItem: {
    opacity: 0.7,
  },
  comingSoonText: {
    fontStyle: 'italic',
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  comingSoonBadgeText: {
    color: Colors.light.background,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  comingSoonIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  comingSoonCategoryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.light.tint,
  },
  comingSoonCategoryText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  notifyButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  notifyButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});