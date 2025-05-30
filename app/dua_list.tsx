import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useNavigation } from 'expo-router';
import { Colors } from '../constants/Colors';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { fetchDuasByCategory, DuaData, getCachedDuasByCategory } from '../components/services/FirebaseService';
import { useAudio } from '../context/AudioContext'; 

export default function DuaListScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { categoryId, categoryName, comingSoon } = useLocalSearchParams();
  const [categoryDuas, setCategoryDuas] = useState<DuaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { stopPlayingSound } = useAudio();
  

  const isCategoryComingSoon = comingSoon === 'true';

  useFocusEffect(
    useCallback(() => {
      stopPlayingSound();
    }, [stopPlayingSound])
  );

  const handleDuaPress = (dua: DuaData) => {
    if (dua.coming_soon) {
      Alert.alert(
        'Coming Soon', // Custom title
        'We\'re working hard to bring you the best possible experience, insha Allah.', // Message
      );
      return;
    }
    router.push({
      pathname: '/dua_detail',
      params: {
        duaData: JSON.stringify(dua),
        categoryName: categoryName as string
      }
    });
  };

  const loadDuas = useCallback(async (useCache: boolean = true) => {
    if (isCategoryComingSoon) {
      setIsLoading(false);
      return;
    }

    setError(null);
    if (useCache) {
      const cachedDuas = await getCachedDuasByCategory(categoryId as string);
      if (cachedDuas.length > 0) {
        setCategoryDuas(cachedDuas);
        setIsLoading(false);
      }
    }

    try {
      const result = await fetchDuasByCategory(categoryId as string, (duas) => {
        setCategoryDuas(duas);
        setIsLoading(false);
        setIsRefreshing(false);
      });
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch duas. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [categoryId, isCategoryComingSoon]);

  useEffect(() => {
    loadDuas();
  }, [loadDuas]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadDuas(false);
  }, [loadDuas]);

  const renderComingSoonCategory = () => (
    <View style={styles.comingSoonContainer}>
      <View style={styles.comingSoonIconContainer}>
        <Ionicons name="hourglass-outline" size={80} color={Colors[theme].tint} />
      </View>
      <ThemedText style={styles.comingSoonCategoryTitle}>Coming Soon</ThemedText>
      <ThemedText style={styles.comingSoonCategoryText}>
        We're working hard to bring you amazing duas for {categoryName}.
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

    if (isLoading && categoryDuas.length === 0) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors[theme].text} />
        </View>
      );
    }

    if (error && categoryDuas.length === 0) {
      return (
        <View style={styles.centerContent}>
          <ThemedText>{error}</ThemedText>
        </View>
      );
    }

    if (categoryDuas.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Ionicons name="information-circle-outline" size={48} color={Colors[theme].text} />
          <ThemedText style={styles.emptyStateText}>No Duas or Dhikr are available for this category.</ThemedText>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <ThemedText>Refresh</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.mainCont}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors[theme].text]}
            tintColor={Colors[theme].text}
          />
        }
      >
        <View style={{ paddingBottom: 75 }}>
          {Array.isArray(categoryDuas) && categoryDuas.map((dua) => (
            <TouchableOpacity key={dua.id} style={styles.duaItem} onPress={() => handleDuaPress(dua)}>
              <View style={styles.duaItemContent}>
                <View style={styles.duaTitleContainer}>
                  <ThemedText type='subtitle' style={[styles.duaTitle, dua.coming_soon && styles.comingSoonTitle]}>
                    {dua.title.trim()}
                  </ThemedText>
                  {dua.coming_soon && (
                    <View style={styles.comingSoonBadge}>
                      <Ionicons name="time-outline" size={12} color={Colors[theme].background} />
                      <ThemedText style={styles.comingSoonBadgeText}>Coming Soon</ThemedText>
                    </View>
                  )}
                </View>
                <Ionicons 
                  name={dua.coming_soon ? "time-outline" : "chevron-forward"} 
                  size={24} 
                  color={Colors[theme].tint} 
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  mainCont: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  duaItem: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  duaItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  duaTitleContainer: {
    flex: 1,
  },
  duaTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  comingSoonTitle: {
    opacity: 0.7,
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  refreshButton: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
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