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
import { fetchInstructionsByCategory, PrayerInstructionData, getCachedInstructionsByCategory } from '../components/services/FirebaseService';
import { useAudio } from '../context/AudioContext'; 

export default function InstructionListScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { categoryId, categoryName, comingSoon } = useLocalSearchParams();
  const [categoryInstructions, setCategoryInstructions] = useState<PrayerInstructionData[]>([]);
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

  const handleInstructionPress = (instruction: PrayerInstructionData) => {
    if (instruction.coming_soon) {
      Alert.alert(
        'Coming Soon',
        'We\'re working hard to bring you the best possible experience, insha Allah.'
      );
      return;
    }
    console.log(`instruction: ${JSON.stringify(instruction)}`);
    router.push({
      pathname: '/instruction_detail',
      params: {
        prayerInstruction: JSON.stringify(instruction),
        madhabName: "",
        categoryName: categoryName as string
      }
    });
  };

  const loadInstructions = useCallback(async (useCache: boolean = true) => {
    if (isCategoryComingSoon) {
      setIsLoading(false);
      return;
    }

    setError(null);
    if (useCache) {
      const cachedInstructions = await getCachedInstructionsByCategory(categoryId as string);
      if (cachedInstructions.length > 0) {
        setCategoryInstructions(cachedInstructions);
        setIsLoading(false);
      }
    }

    try {
      const result = await fetchInstructionsByCategory(categoryId as string, (instructions) => {
        setCategoryInstructions(instructions);
        setIsLoading(false);
        setIsRefreshing(false);
      });
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch instructions. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [categoryId, isCategoryComingSoon]);

  useEffect(() => {
    loadInstructions();
  }, [loadInstructions]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadInstructions(false);
  }, [loadInstructions]);

  const renderComingSoonCategory = () => (
    <View style={styles.comingSoonContainer}>
      <View style={styles.comingSoonIconContainer}>
        <Ionicons name="hourglass-outline" size={80} color={Colors[theme].tint} />
      </View>
      <ThemedText style={styles.comingSoonCategoryTitle}>Coming Soon</ThemedText>
      <ThemedText style={styles.comingSoonCategoryText}>
        We're working hard to bring you amazing instructions for {categoryName}.
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

    if (isLoading && categoryInstructions.length === 0) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors[theme].text} />
        </View>
      );
    }

    if (error && categoryInstructions.length === 0) {
      return (
        <View style={styles.centerContent}>
          <ThemedText>{error}</ThemedText>
        </View>
      );
    }

    if (categoryInstructions.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Ionicons name="information-circle-outline" size={48} color={Colors[theme].text} />
          <ThemedText style={styles.emptyStateText}>No instructions are available for this category.</ThemedText>
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
          {Array.isArray(categoryInstructions) && categoryInstructions.map((instruction) => (
            <TouchableOpacity key={instruction.id} style={styles.instructionItem} onPress={() => handleInstructionPress(instruction)}>
              <View style={styles.instructionItemContent}>
                <View style={styles.instructionTitleContainer}>
                  <ThemedText type='subtitle' style={[styles.instructionTitle, instruction.coming_soon && styles.comingSoonTitle]}>
                    {instruction.title.trim()}
                  </ThemedText>
                  {instruction.coming_soon && (
                    <View style={styles.comingSoonBadge}>
                      <Ionicons name="time-outline" size={12} color={Colors[theme].background} />
                      <ThemedText style={styles.comingSoonBadgeText}>Coming Soon</ThemedText>
                    </View>
                  )}
                </View>
                <Ionicons 
                  name={instruction.coming_soon ? "time-outline" : "chevron-forward"} 
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
  instructionItem: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  instructionItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  instructionTitleContainer: {
    flex: 1,
  },
  instructionTitle: {
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