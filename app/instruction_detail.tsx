import React, { useState, useEffect, useRef, useCallback, ReactElement } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ScrollView, Dimensions, ActivityIndicator, Alert, NativeSyntheticEvent, NativeScrollEvent, Text, Platform, InteractionManager, NativeModules } from 'react-native';
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Image } from 'expo-image';
import Video from 'react-native-video';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import { PrayerInstructionData, PrayerStepData } from '../components/services/FirebaseService';
import AudioPlayer from '../components/AudioPlayer';
import { useAudio } from '../context/AudioContext';

const screenWidth = Dimensions.get('window').width;
const imageWidth = screenWidth - 32; // Subtracting horizontal padding

// Add validation functions
const validatePrayerData = (data: any): data is PrayerInstructionData => {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.prayer_steps) &&
    data.prayer_steps.every(validatePrayerStep)
  );
};

const validatePrayerStep = (step: any): step is PrayerStepData => {
  return (
    step &&
    typeof step === 'object' &&
    typeof step.title === 'string' &&
    typeof step.description === 'string' &&
    typeof step.rakat_number === 'string'
  );
};

// Helper function to ensure video operations run on the main thread
const runOnMainThread = async (operation: () => Promise<void>) => {
  return new Promise<void>((resolve, reject) => {
    if (Platform.OS === 'ios') {
      // For iOS, requestAnimationFrame ensures we're on the main thread
      requestAnimationFrame(async () => {
        try {
          await operation();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    } else {
      // For Android, we need to use a more reliable approach to ensure main thread execution
      // This helps prevent the 'Player is accessed on the wrong thread' error
      const { UIManager } = NativeModules;
      UIManager.setLayoutAnimationEnabledExperimental?.(false);
      setTimeout(async () => {
        try {
          await operation();
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 0);
    }
  });
};

// Enhanced Video Player component with play overlay and improved controls
const VideoPlayer = ({ url }: { url: string }) => {
  const [isMuted, setIsMuted] = useState(true); // Start muted
  const [isPlaying, setIsPlaying] = useState(false); // Start paused with play button
  const [hasEnded, setHasEnded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);
  const { theme } = useTheme();
  const isMounted = useRef(true);
  
  // Ensure component is mounted when performing operations
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const handleVideoEnd = () => {
    // When video ends, update the play state to show play button instead of pause
    setIsPlaying(false);
    setHasEnded(true);
    // Do not seek to the beginning; stay at the last frame
  };
  
  const handlePlayPress = async () => {
    try {
      // Set state immediately to improve responsiveness
      if (hasEnded) {
        // Video has ended - start playing from beginning
        setHasEnded(false);
        setIsPlaying(true);
        
        // Seek to beginning immediately - wrapped in runOnMainThread
        if (videoRef.current) {
          // No need to await here - this allows the UI to update immediately
          runOnMainThread(async () => {
            if (isMounted.current && videoRef.current) {
              videoRef.current.seek(0);
            }
          }).catch(err => console.warn('Error seeking video:', err));
        }
      } else {
        // Normal play/pause toggle during playback - set immediately
        setIsPlaying(prevState => !prevState);
      }
      
      // Unmute the video when play button is clicked
      if (isMuted) {
        setIsMuted(false);
      }
    } catch (error) {
      console.warn('Error handling play press:', error);
    }
  };
  
  const handleRefresh = async () => {
    try {
      // Always set to playing state and not ended - set immediately
      setHasEnded(false);
      setIsPlaying(true);
      
      // Unmute the video when refresh button is clicked
      if (isMuted) {
        setIsMuted(false);
      }
      
      // Seek to beginning immediately - wrapped in runOnMainThread
      if (videoRef.current) {
        // No need to await here - this allows the UI to update immediately
        runOnMainThread(async () => {
          if (isMounted.current && videoRef.current) {
            videoRef.current.seek(0);
          }
        }).catch(err => console.warn('Error seeking video:', err));
      }
    } catch (error) {
      console.warn('Error handling refresh:', error);
    }
  };
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  return (
    <View style={styles.videoWrapper}>
      <TouchableOpacity 
        style={styles.videoTouchable}
        activeOpacity={1}
        onPress={handlePlayPress}
      >
        <Video
          ref={videoRef}
          source={{ uri: url }}
          style={styles.inlineVideo}
          resizeMode="cover"
          paused={!isPlaying}
          muted={isMuted}
          repeat={false}
          playInBackground={false}
          playWhenInactive={false}
          onEnd={handleVideoEnd}
          onLoad={handleLoad}
          onError={(error) => {
            console.warn(`Failed to load video: ${url}`, error);
            if (isMounted.current) {
              setLoadError('Video unavailable');
              setIsLoaded(false);
            }
          }}
        />
      </TouchableOpacity>
      
      {/* Show error message if video failed to load */}
      {loadError && (
        <View style={styles.errorOverlay}>
          <ThemedText style={styles.errorText}>{loadError}</ThemedText>
        </View>
      )}
      
      {/* Play button overlay when video is paused or ended */}
      {isLoaded && !loadError && (!isPlaying || hasEnded) && (
        <TouchableOpacity 
          style={styles.playButtonOverlay}
          activeOpacity={0.7}
          onPress={handlePlayPress}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <View style={styles.playButtonCircle}>
            <Ionicons 
              name="play" 
              size={40} 
              color={Colors[theme].background} 
            />
          </View>
        </TouchableOpacity>
      )}
      
      <View style={styles.videoControls}>
        <TouchableOpacity 
          style={styles.videoControlButton}
          activeOpacity={0.7}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons 
            name={isMuted ? "volume-mute" : "volume-high"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.videoControlButton}
          activeOpacity={0.7}
          onPress={handlePlayPress}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.videoControlButton}
          activeOpacity={0.7}
          onPress={handleRefresh}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function PrayerDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { prayerInstruction, madhabName, categoryName } = useLocalSearchParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [prayerData, setPrayerData] = useState<PrayerInstructionData | null>(null);
  const { stopPlayingSound } = useAudio();
  const flatListRef = useRef<FlatList>(null);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);

  // Add window size configuration for FlatList
  const windowSize = useRef(3); // Render 3 items at a time (current, previous, next)

  // Optimize FlatList rendering
  const getItemLayout = useCallback((data: ArrayLike<PrayerStepData> | null | undefined, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: PrayerStepData, index: number) => 
    `${item.id || index}-${item.title}`, []);

  useEffect(() => {
    if (prayerInstruction) {
      try {
        const parsedData = JSON.parse(prayerInstruction as string);
        
        if (!validatePrayerData(parsedData)) {
          throw new Error('Invalid prayer data structure');
        }
        
        setPrayerData(parsedData);
        
        const urls = parsedData.prayer_steps.flatMap(step => {
          const matches = step.description.match(/\[audio\](.*?)\[\/audio\]/g) || [];
          return matches.map(match => match.replace(/\[audio\]|\[\/audio\]/g, ''));
        });
        setAudioUrls(urls);
      } catch (error) {
        console.error('Error parsing prayer data:', error);
        Alert.alert(
          'Error',
          'Failed to load prayer instructions. Please try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }
  }, [prayerInstruction, navigation]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
      flatListRef.current?.scrollToIndex({ index: currentStepIndex - 1, animated: true });
      stopPlayingSound();
    }
  }, [currentStepIndex, stopPlayingSound]);

  const goToNextStep = useCallback(() => {
    if (prayerData && currentStepIndex < prayerData.prayer_steps.length - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
      flatListRef.current?.scrollToIndex({ index: currentStepIndex + 1, animated: true });
      stopPlayingSound();
    }
  }, [currentStepIndex, prayerData, stopPlayingSound]);

  const parseDescription = useCallback((description: string): ReactElement[] => {
    try {
      const parts = description.split(/(\[audio\].*?\[\/audio\]|\[image\].*?\[\/image\]|\[lottie\].*?\[\/lottie\]|\[video\].*?\[\/video\])/);
      return parts.reduce<ReactElement[]>((acc, part, index) => {
        if (!part.trim()) return acc;

        try {
          if (part.startsWith('[audio]') && part.endsWith('[/audio]')) {
            const audioUrl = part.slice(7, -8);
            if (!audioUrl) {
              console.warn('Empty audio URL found');
              return acc;
            }
            const audioIndex = audioUrls.indexOf(audioUrl);
            acc.push(
              <View key={`audio-container-${index}`} style={styles.mediaContainer}>
                <AudioPlayer key={`audio-${audioIndex}`} audioUrl={audioUrl} />
              </View>
            );
          } else if (part.startsWith('[image]') && part.endsWith('[/image]')) {
            const imageUrl = part.slice(7, -8);
            if (!imageUrl) {
              console.warn('Empty image URL found');
              return acc;
            }
            acc.push(
              <View key={`image-container-${index}`} style={styles.mediaContainer}>
                <Image
                  key={`image-${index}`}
                  source={{ uri: imageUrl }}
                  style={styles.inlineImage}
                  contentFit="contain"
                  onError={() => console.warn(`Failed to load image: ${imageUrl}`)}
                />
              </View>
            );
          } else if (part.startsWith('[lottie]') && part.endsWith('[/lottie]')) {
            const lottieUrl = part.slice(8, -9);
            if (!lottieUrl) {
              console.warn('Empty Lottie URL found');
              return acc;
            }
            acc.push(
              <View key={`lottie-container-${index}`} style={styles.mediaContainer}>
                <LottieView
                  key={`lottie-${index}`}
                  source={{ uri: lottieUrl }}
                  autoPlay
                  loop
                  style={styles.inlineLottie}
                  onAnimationFailure={() => console.warn(`Failed to load Lottie animation: ${lottieUrl}`)}
                />
              </View>
            );
          } else if (part.startsWith('[video]') && part.endsWith('[/video]')) {
            const videoUrl = part.slice(7, -8);
            if (!videoUrl) {
              console.warn('Empty Video URL found');
              return acc;
            }
            
            // Validate the video URL before passing it to the VideoPlayer
            const isValidUrl = videoUrl && (
              videoUrl.startsWith('http://') || 
              videoUrl.startsWith('https://') || 
              videoUrl.startsWith('file://') ||
              videoUrl.startsWith('asset://')
            );
            
            if (!isValidUrl) {
              console.warn(`Invalid video URL format: ${videoUrl}`);
              // Return a placeholder or error message instead of the video
              acc.push(
                <View key={`video-error-${index}`} style={[styles.mediaContainer, styles.mediaError]}>
                  <ThemedText style={styles.errorText}>Video unavailable</ThemedText>
                </View>
              );
              return acc;
            }
            
            acc.push(
              <View key={`video-container-${index}`} style={styles.mediaContainer}>
                <VideoPlayer url={videoUrl} />
              </View>
            );
          } else {
            acc.push(
              <ThemedText key={`text-${index}`} style={styles.stepDescription}>
                {part.trim()}
              </ThemedText>
            );
          }
        } catch (error) {
          console.error('Error parsing description part:', error);
          acc.push(
            <ThemedText key={`error-${index}`} style={[styles.stepDescription, { color: 'red' }]}>
              [Error loading media content]
            </ThemedText>
          );
        }
        return acc;
      }, []);
    } catch (error) {
      console.error('Error parsing description:', error);
      return [
        <ThemedText key="error" style={[styles.stepDescription, { color: 'red' }]}>
          Error loading content
        </ThemedText>
      ];
    }
  }, [audioUrls]);

  const renderStepContent = useCallback(({ item: step }: { item: PrayerStepData }) => (
    <View style={styles.stepContainer}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <ThemedText style={styles.staticHeader}>
            {madhabName ? `${madhabName} > ${prayerData?.title}` : prayerData?.title}
          </ThemedText>
          <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
          {step.rakat_number !== "none" && (
            <ThemedText style={styles.stepRakat}>Rakat: {step.rakat_number}</ThemedText>
          )}
          <View style={styles.descriptionContainer}>
            {parseDescription(step.description)}
          </View>
        </View>
      </ScrollView>
    </View>
  ), [madhabName, prayerData, parseDescription]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(currentOffset / screenWidth);
    
    if (nextIndex !== currentStepIndex) {
      setCurrentStepIndex(nextIndex);
      stopPlayingSound();
    }
    
    if (!isScrolling) {
      setIsScrolling(true);
      stopPlayingSound();
    }
  }, [currentStepIndex, isScrolling, stopPlayingSound]);

  const handleScrollEnd = useCallback(() => {
    setIsScrolling(false);
  }, []);

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
      {!prayerData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[theme].text} />
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={prayerData.prayer_steps}
            renderItem={renderStepContent}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScrollEnd}
            removeClippedSubviews={true}
            maxToRenderPerBatch={windowSize.current}
            windowSize={windowSize.current}
            initialNumToRender={1}
            updateCellsBatchingPeriod={50}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          />
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              onPress={goToPreviousStep} 
              style={[styles.navButton, currentStepIndex === 0 && styles.disabledButton]}
              disabled={currentStepIndex === 0}
            >
              <Ionicons name="chevron-back" size={24} color={Colors[theme].text} />
            </TouchableOpacity>
            <ThemedText style={styles.stepIndicator}>
              {currentStepIndex + 1} / {prayerData.prayer_steps.length}
            </ThemedText>
            <TouchableOpacity 
              onPress={goToNextStep} 
              style={[styles.navButton, currentStepIndex === prayerData.prayer_steps.length - 1 && styles.disabledButton]}
              disabled={currentStepIndex === prayerData.prayer_steps.length - 1}
            >
              <Ionicons name="chevron-forward" size={24} color={Colors[theme].text} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    width: screenWidth,
    height: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  contentContainer: {
    width: screenWidth,
    paddingHorizontal: 16,
  },
  staticHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.light.tint,
    textAlign: 'center'
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  stepRakat: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center'
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  stepIndicator: {
    fontSize: 16,
  },
  descriptionContainer: {
    flexDirection: 'column',
  },
  mediaContainer: {
    marginBottom: 20, // Increased from 0 to create space between video and text
  },
  inlineImage: {
    width: imageWidth,
    height: imageWidth,
  },
  inlineLottie: {
    width: imageWidth,
    height: imageWidth,
  },
  inlineVideo: {
    width: imageWidth * 0.8,
    height: imageWidth * 1.3, // Vertical aspect ratio
    alignSelf: 'center',
    borderRadius: 8,
  },
  videoWrapper: {
    position: 'relative',
    width: imageWidth * 0.8,
    height: imageWidth * 1.3,
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoTouchable: {
    width: '100%',
    height: '100%',
  },
  videoControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 10,
  },
  videoControlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  playButtonCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5, // Offset for the play icon to appear centered
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
  },
  mediaError: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});