import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, InteractionManager, UIManager, NativeModules } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { ThemedText } from '../components/ThemedText';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';

interface AudioPlayerProps {
  audioUrl: string;
}

interface AudioError extends Error {
  code?: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const { theme } = useTheme();
  const { playingSound, setPlayingSound, stopPlayingSound } = useAudio();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const isMounted = useRef(true);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const initiallyMuted = useRef(true); // Track if audio was initially muted

  // Add memory pressure monitoring
  const [memoryPressure, setMemoryPressure] = useState<'normal' | 'high'>('normal');
  const memoryCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Add cleanup queue
  const cleanupQueue = useRef<(() => Promise<void>)[]>([]);

  // Add initial load effect
  useEffect(() => {
    if (audioUrl) {
      loadAudio();
    }
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [audioUrl]);

  const stopPositionUpdate = useCallback(() => {
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
      positionUpdateInterval.current = null;
    }
  }, []);

  const unloadSound = useCallback(async () => {
    if (sound) {
      try {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
      } catch (err) {
        console.log('Error unloading sound:', err);
      }
    }
  }, [sound]);

  // Clear audio cache
  const clearAudioCache = useCallback(async () => {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const files = await FileSystem.readDirectoryAsync(cacheDir);
        for (const file of files) {
          if (file.endsWith('.mp3') || file.endsWith('.wav')) {
            await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
          }
        }
      }
    } catch (error) {
      console.log('Error clearing audio cache:', error);
    }
  }, []);

  // Enhanced cleanup function
  const cleanup = useCallback(async () => {
    try {
      // Execute all cleanup functions in the queue
      for (const cleanupFn of cleanupQueue.current) {
        await cleanupFn();
      }
      cleanupQueue.current = [];
      
      // Stop position updates
      stopPositionUpdate();
      
      // Unload sound
      await unloadSound();
      
      // Clear any pending timeouts
      if (memoryCheckInterval.current) {
        clearInterval(memoryCheckInterval.current);
      }
    } catch (error) {
      console.log('Error during cleanup:', error);
    }
  }, [stopPositionUpdate, unloadSound]);

  // Monitor memory pressure
  useEffect(() => {
    if (Platform.OS === 'ios') {
      memoryCheckInterval.current = setInterval(async () => {
        try {
          const memoryInfo = await FileSystem.getFreeDiskStorageAsync();
          const isLowMemory = memoryInfo < 100 * 1024 * 1024; // Less than 100MB free
          setMemoryPressure(isLowMemory ? 'high' : 'normal');
          
          if (isLowMemory) {
            // Clear cache when memory is low
            await clearAudioCache();
          }
        } catch (error) {
          console.log('Error checking memory pressure:', error);
        }
      }, 30000); // Check every 30 seconds

      return () => {
        if (memoryCheckInterval.current) {
          clearInterval(memoryCheckInterval.current);
        }
      };
    }
  }, []);

  // Helper function to ensure operations run on the main thread
  const runOnMainThread = useCallback(async (operation: () => Promise<void>) => {
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
  }, []);
  
  // Enhanced useEffect cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [cleanup]);

  const loadAudio = async (forceDownload = false) => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    setError(null);
    retryCount.current = 0; // Reset retry count on each new load attempt
    
    // Cleanup any existing sound
    await cleanup();
    
    try {
      await runOnMainThread(async () => {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: true,
        });

        console.log(`Loading audio URL: ${audioUrl}`);

        // Try to get cached URI first
        let audioUri;
        try {
          audioUri = await getCachedAudioUri(audioUrl, forceDownload);
          console.log(`Using cached audio URI: ${audioUri}`);
        } catch (err) {
          console.log('Error getting cached audio URI:', err);
          audioUri = audioUrl; // Fallback to original URL if caching fails
          console.log(`Falling back to original URL: ${audioUri}`);
        }

        // Progressive loading approach - first try with a shorter timeout
        // This helps devices with good connections load quickly
        try {
          console.log('Attempting fast load with 10 second timeout');
          const fastLoadPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Fast load timeout')), 10000);
          });

          const createSoundPromise = Audio.Sound.createAsync(
            { uri: audioUri },
            { shouldPlay: false },
            onPlaybackStatusUpdate
          );

          const { sound: newSound } = await Promise.race([createSoundPromise, fastLoadPromise]) as { sound: Audio.Sound };
          handleSuccessfulLoad(newSound);
          return; // Exit early if fast load succeeds
        } catch (fastError) {
          // Fast load failed, continue with longer timeout
          console.log('Fast load failed, attempting with longer timeout:', fastError);
          // Don't return or throw here - continue to extended timeout
        }

        // Extended timeout for slower connections (60 seconds)
        console.log('Attempting extended load with 60 second timeout');
        const extendedTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Extended sound creation timeout')), 60000);
        });

        const createExtendedSoundPromise = Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: false, progressUpdateIntervalMillis: 100 }, // More frequent updates to detect loading progress
          onPlaybackStatusUpdate
        );

        try {
          const { sound: newSound } = await Promise.race([createExtendedSoundPromise, extendedTimeoutPromise]) as { sound: Audio.Sound };
          handleSuccessfulLoad(newSound);
        } catch (extendedError) {
          throw extendedError; // Let the outer catch handle this
        }
      });
    } catch (err) {
      const error = err as AudioError;
      console.log('Error loading sound:', error);
      
      // Special handling for timeout errors
      if (error.message && (error.message.includes('timeout') || error.message.includes('timed out'))) {
        console.log('Timeout detected, trying alternative loading strategy');
        await handleTimeoutError(forceDownload);
        return;
      }
      
      // Try re-downloading if not already forced
      if (!forceDownload) {
        console.log('Attempting to re-download audio');
        loadAudio(true);
        return;
      }
      
      // Network or file not found errors
      if (error.code && (error.code === -11800 || error.code === -1100) && retryCount.current < maxRetries) {
        retryCount.current += 1;
        console.log(`Retrying audio load (attempt ${retryCount.current}/${maxRetries})...`);
        // Exponential backoff for retries
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount.current - 1), 10000);
        setTimeout(() => loadAudio(true), backoffTime);
        return;
      }

      // Determine appropriate error message
      let errorMessage = 'Failed to load audio. Please try again.';
      if (error.message && error.message.includes('timeout')) {
        errorMessage = 'Audio is taking too long to load. Please check your connection and try again.';
      } else if (error.code === -11800) {
        errorMessage = 'Network error or invalid audio file. Please check your connection and try again.';
      } else if (error.code === -1100) {
        errorMessage = 'Audio file not found. Please check the URL and try again.';
      }
      
      if (isMounted.current) {
        setError(errorMessage);
        setIsLoading(false); // Ensure loading state is cleared on error
      }
    }
  };

  // Helper function to handle successful sound loading
  const handleSuccessfulLoad = async (newSound: Audio.Sound) => {
    if (!isMounted.current) {
      await newSound.unloadAsync();
      return;
    }

    setSound(newSound);
    const status = await newSound.getStatusAsync();
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setIsLoading(false);
    }

    // Add cleanup function to queue
    cleanupQueue.current.push(async () => {
      if (newSound) {
        await newSound.unloadAsync();
      }
    });
  };

  // Special handler for timeout errors
  const handleTimeoutError = async (forceDownload: boolean) => {
    if (retryCount.current >= maxRetries) {
      if (isMounted.current) {
        setError('Audio is taking too long to load. Please try again later.');
        setIsLoading(false);
      }
      return;
    }

    retryCount.current += 1;
    console.log(`Timeout retry attempt ${retryCount.current}/${maxRetries}`);
    
    try {
      // Try to clear the cache for this specific audio
      if (audioUrl) {
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.MD5,
          audioUrl
        );
        const cacheDir = FileSystem.cacheDirectory;
        const filePath = `${cacheDir}audio-${hash}.mp3`;
        
        try {
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
            console.log('Deleted cached audio file:', filePath);
          }
        } catch (e) {
          console.log('Error checking/deleting cached file:', e);
        }
      }
      
      // Try with a different approach - lower quality or different settings
      setTimeout(() => {
        if (isMounted.current) {
          loadAudio(true); // Force download on retry
        }
      }, 1000 * retryCount.current); // Increasing delay with each retry
    } catch (e) {
      console.log('Error in timeout handler:', e);
      if (isMounted.current) {
        setError('Failed to load audio after multiple attempts. Please try again later.');
        setIsLoading(false);
      }
    }
  };

  const getCachedAudioUri = async (url: string, forceDownload = false): Promise<string> => {
    // For remote URLs, initially try direct streaming without caching
    if (url.startsWith('http') && !forceDownload) {
      return url;
    }

    try {
      // Add timeout for the operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Audio loading timeout')), 10000);
      });

      const loadingPromise = (async () => {
        // Trim the URL and remove any trailing characters after file extension
        const trimmedUrl = url.trim();
        const urlWithoutQuery = trimmedUrl.split('?')[0];
        
        // Create a unique filename based on the URL
        const urlHash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          urlWithoutQuery
        );
        
        // Extract file extension, defaulting to 'mp3' if not found
        const fileExtension = urlWithoutQuery.split('.').pop() || 'mp3';
        
        // Ensure the file extension is clean
        const cleanExtension = fileExtension.replace(/[^a-zA-Z0-9]/g, '');
        
        const filename = `${urlHash.slice(0, 16)}.${cleanExtension}`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        
        // Check if file exists and is valid
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        if (fileInfo.exists && !forceDownload) {
          // Verify file is not corrupted
          try {
            const fileStats = await FileSystem.getInfoAsync(fileUri);
            if (!fileStats.exists || fileStats.size === undefined || fileStats.size === 0) {
              throw new Error('Cached file is empty or invalid');
            }
            console.log('Loading audio from cache');
            return fileUri;
          } catch (err) {
            console.log('Cached file is invalid, falling back to remote URL');
            return url;
          }
        }
    
        if (forceDownload || !fileInfo.exists) {
          console.log('Attempting to download audio to cache');
          try {
            await FileSystem.deleteAsync(fileUri, { idempotent: true });
            const downloadResult = await FileSystem.downloadAsync(trimmedUrl, fileUri);
            
            // Verify downloaded file
            if (downloadResult.status !== 200 || downloadResult.uri !== fileUri) {
              console.log('Download failed, falling back to remote URL');
              return url;
            }
            return downloadResult.uri;
          } catch (err) {
            console.log('Download failed, falling back to remote URL');
            return url;
          }
        }
        
        return fileUri;
      })();

      // Race between timeout and loading
      return await Promise.race([loadingPromise, timeoutPromise]) as string;
    } catch (err) {
      console.log('Error during caching, falling back to remote URL:', err);
      return url;
    }
  };

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    
    setDuration(status.durationMillis || 0);
    if (!isSeeking) {
      setPosition(status.positionMillis);
    }
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPlayingSound(null);
      stopPositionUpdate();
    }
  }, [setPlayingSound, isSeeking, stopPositionUpdate]);

  const startPositionUpdate = useCallback(() => {
    stopPositionUpdate();
    positionUpdateInterval.current = setInterval(async () => {
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            setPosition(status.positionMillis);
          }
        } catch (err) {
          console.log('Error updating position:', err);
        }
      }
    }, 100);
  }, [sound]);

  const playPauseAudio = useCallback(async () => {
    if (!sound) return;

    try {
      await runOnMainThread(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
            setPlayingSound(null);
            stopPositionUpdate();
          } else {
            if (playingSound && playingSound !== sound) {
              await stopPlayingSound();
            }
            
            // If audio is muted and was initially muted, restart it when playing
            if (isMuted && initiallyMuted.current) {
              console.log('Restarting audio from beginning when unmuting');
              await sound.setPositionAsync(0);
            } else if (status.positionMillis === status.durationMillis) {
              // Otherwise only restart if at the end
              await sound.setPositionAsync(0);
            }
            
            // Unmute when playing
            if (isMuted) {
              setIsMuted(false);
              await sound.setIsMutedAsync(false);
            }
            
            await sound.playAsync();
            setIsPlaying(true);
            setPlayingSound(sound);
            startPositionUpdate();
          }
        }
      });
    } catch (err) {
      console.log('Error playing/pausing audio:', err);
      setError('Failed to play audio. Please try again.');
    }
  }, [sound, playingSound, stopPlayingSound, setPlayingSound, startPositionUpdate, stopPositionUpdate, runOnMainThread, isMuted]);

  const seekAudio = useCallback(async (value: number) => {
    if (!sound) return;

    try {
      await runOnMainThread(async () => {
        await sound.setPositionAsync(value);
        setPosition(value);
        
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            startPositionUpdate();
          } else {
            setPosition(value);
          }
        }
      });
    } catch (err) {
      console.log('Error seeking audio:', err);
      setError('Failed to seek audio. Please try again.');
    } finally {
      setIsSeeking(false);
    }
  }, [sound, startPositionUpdate, runOnMainThread]);

  const onSlidingStart = useCallback(() => {
    setIsSeeking(true);
    stopPositionUpdate();
  }, [stopPositionUpdate]);

  const onSlidingComplete = useCallback((value: number) => {
    seekAudio(value);
  }, [seekAudio]);

  const toggleMute = useCallback(async () => {
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
      }
    } catch (err) {
      console.log('Error toggling mute:', err);
      setError('Failed to mute audio. Please try again.');
    }
  }, [sound, isMuted]);

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`;
  };

  return (
    <View style={styles.audioPlayer}>
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors[theme].text} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity onPress={() => loadAudio(true)} style={styles.retryButton}>
            <Ionicons name="reload" size={24} color={Colors[theme].text} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity onPress={playPauseAudio} style={styles.playButton}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color={Colors[theme].text} 
            />
          </TouchableOpacity>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingStart={onSlidingStart}
              onSlidingComplete={onSlidingComplete}
              minimumTrackTintColor={Colors[theme].tint}
              maximumTrackTintColor={Colors[theme].icon}
              thumbTintColor={Colors[theme].tint}
            />
          </View>
          <ThemedText style={styles.timeRemaining}>
            {formatTime(duration - position)}
          </ThemedText>
          <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
            <Ionicons 
              name={isMuted ? "volume-mute" : "volume-medium"} 
              size={24} 
              color={Colors[theme].text} 
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2, // Reduced from 4 to 2
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
    padding: 4, // Reduced from 6 to 4
    minHeight: 40, // Reduced from 46 to 40
  },
  playButton: {
    padding: 8,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  slider: {
    flex: 1,
  },
  timeRemaining: {
    marginHorizontal: 4,
    fontSize: 12,
    textAlign: 'right',
  },
  muteButton: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginRight: 10,
  },
  retryButton: {
    padding: 8,
  },
});

export default AudioPlayer;