import React, { useCallback, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Text } from 'react-native';
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import { DuaData } from '../components/services/FirebaseService';
import AudioPlayer from '../components/AudioPlayer';
import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import Video from 'react-native-video';

// Enhanced Video Player component with play overlay and improved controls
const VideoPlayer = ({ url }: { url: string }) => {
  const [isMuted, setIsMuted] = useState(true); // Start muted
  const [isPlaying, setIsPlaying] = useState(false); // Start paused with play button
  const [hasEnded, setHasEnded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<Video>(null);
  const { theme } = useTheme();
  
  const handleVideoEnd = () => {
    // When video ends, update the play state to show play button instead of pause
    setIsPlaying(false);
    setHasEnded(true);
    // Do not seek to the beginning; stay at the last frame
  };
  
  const handlePlayPress = () => {
    // Handle different states
    if (hasEnded) {
      // Video has ended - start playing from beginning
      setHasEnded(false);
      setIsPlaying(true);
      
      // Seek to beginning immediately
      videoRef.current?.seek(0);
    } else {
      // Normal play/pause toggle during playback
      setIsPlaying(!isPlaying);
    }
    
    // Unmute the video when play button is clicked
    if (isMuted) {
      setIsMuted(false);
    }
  };
  
  const handleRefresh = () => {
    // Always set to playing state and not ended
    setHasEnded(false);
    setIsPlaying(true);
    
    // Unmute the video when refresh button is clicked
    if (isMuted) {
      setIsMuted(false);
    }
    
    // Seek to beginning immediately
    videoRef.current?.seek(0);
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
          onError={(error) => console.warn(`Failed to load video: ${url}`, error)}
        />
      </TouchableOpacity>
      
      {/* Play button overlay when video is paused or ended */}
      {isLoaded && (!isPlaying || hasEnded) && (
        <TouchableOpacity 
          style={styles.playButtonOverlay}
          activeOpacity={0.7}
          onPress={handlePlayPress}
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

export default function DuaDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { duaData, categoryName } = useLocalSearchParams();
  const dua: DuaData = JSON.parse(duaData as string);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Set scrolling state to pause videos when scrolling
    setIsScrolling(true);
    // Clear the scrolling state after a short delay
    clearTimeout((handleScroll as any).timeoutId);
    (handleScroll as any).timeoutId = setTimeout(() => {
      setIsScrolling(false);
    }, 200);
  };

  const Reference = ({ reference }: { reference: string }) => (
    <View style={styles.referenceContainer}>
      <Ionicons name="book-outline" size={20} color={Colors[theme].text} style={styles.referenceIcon} />
      <View style={styles.referenceTextContainer}>
        <ThemedText style={styles.referenceLabel}>Reference:</ThemedText>
        <ThemedText style={styles.referenceText}>{reference}</ThemedText>
      </View>
    </View>
  );

  // Function to parse Arabic text and handle audio tags
  const parseArabicText = (text: string) => {
    if (!text) return null;
    
    // Use the same parsing logic as parseTransliteration
    const parts = text.split(/(\[audio\].*?\[\/audio\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[audio]') && part.endsWith('[/audio]')) {
        const audioUrl = part.slice(7, -8);
        return (
          <View key={`arabic-audio-${index}`} style={styles.mediaContainer}>
            <AudioPlayer key={`arabic-audio-player-${index}`} audioUrl={audioUrl} />
          </View>
        );
      } else if (part.trim()) {
        return <ThemedText key={`arabic-text-${index}`} style={styles.arabic}>{part}</ThemedText>;
      }
      return null;
    });
  };

  const parseTransliteration = useCallback((text: string) => {
    if (!text) return null;
    
    // Split by all media tags
    const parts = text.split(/(\[audio\].*?\[\/audio\]|\[image\].*?\[\/image\]|\[lottie\].*?\[\/lottie\]|\[video\].*?\[\/video\])/);
    // Use map instead of reduce for consistency with parseArabicText
    return parts.map((part, index) => {
      if (part.startsWith('[audio]') && part.endsWith('[/audio]')) {
        const audioUrl = part.slice(7, -8);
        return (
          <View key={`transliteration-audio-${index}`} style={styles.mediaContainer}>
            <AudioPlayer key={`transliteration-audio-player-${index}`} audioUrl={audioUrl} />
          </View>
        );
      } else if (part.startsWith('[image]') && part.endsWith('[/image]')) {
        const imageUrl = part.slice(7, -8);
        return (
          <View key={`transliteration-image-${index}`} style={styles.mediaContainer}>
            <Image
              key={`transliteration-image-${index}`}
              source={{ uri: imageUrl }}
              style={styles.inlineImage}
              contentFit="contain"
            />
          </View>
        );
      } else if (part.startsWith('[lottie]') && part.endsWith('[/lottie]')) {
        const lottieUrl = part.slice(8, -9);
        return (
          <View key={`transliteration-lottie-${index}`} style={styles.mediaContainer}>
            <LottieView
              key={`transliteration-lottie-${index}`}
              source={{ uri: lottieUrl }}
              autoPlay
              loop
              style={styles.inlineLottie}
            />
          </View>
        );
      } else if (part.startsWith('[video]') && part.endsWith('[/video]')) {
        const videoUrl = part.slice(7, -8);
        
        return (
          <View key={`transliteration-video-${index}`} style={styles.mediaContainer}>
            <VideoPlayer url={videoUrl} />
          </View>
        );
      } else if (part.trim()) {
        return (
          <ThemedText key={`transliteration-text-${index}`} style={styles.transliteration}>
            {part}
          </ThemedText>
        );
      }
      return null;
    });
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
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{
          paddingBottom: 32
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <ThemedText style={styles.title}>{dua.title}</ThemedText>
        <View style={styles.arabicContainer}>
          {parseArabicText(dua.arabic_text)}
        </View>
        {dua.audio && (dua.audio.url || dua.audio.file) && (
          <AudioPlayer audioUrl={dua.audio.url || dua.audio.file} />
        )}
        <View style={styles.transliterationContainer}>
          {parseTransliteration(dua.english_transliteration)}
        </View>
        <View style={styles.typeContainer}>
          <Ionicons name="bookmark-outline" size={20} color={Colors[theme].text} />
          <ThemedText style={styles.type}>{dua.type}</ThemedText>
        </View>
        <ThemedText style={styles.translation}>{dua.english_translation}</ThemedText>
        {dua.reference && dua.reference.trim() !== '' && (
          <Reference reference={dua.reference} />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const imageWidth = Dimensions.get('window').width - 32;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  arabicContainer: {
    marginBottom: 4,
  },
  arabic: {
    fontSize: 20,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 4,
  },
  transliterationContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  transliteration: {
    fontSize: 18,
    fontStyle: 'italic',
  },
  translation: {
    fontSize: 16,
    fontWeight: 'bold',
    opacity: 0.6,
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  type: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  referenceIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  referenceTextContainer: {
    flex: 1,
  },
  referenceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  mediaContainer: {
    marginVertical: 4, // Reduced from 8 to 4
  },
  inlineImage: {
    width: '100%',
    height: 200,
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
});