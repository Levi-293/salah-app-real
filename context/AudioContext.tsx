import React, { createContext, useContext, useState, useCallback } from 'react';
import { Audio } from 'expo-av';

interface AudioContextType {
  playingSound: Audio.Sound | null;
  setPlayingSound: (sound: Audio.Sound | null) => void;
  stopPlayingSound: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playingSound, setPlayingSound] = useState<Audio.Sound | null>(null);

  const stopPlayingSound = useCallback(async () => {
    if (playingSound) {
      try {
        const status = await playingSound.getStatusAsync();
        if (status.isLoaded) {
          await playingSound.pauseAsync();
        }
      } catch (error) {
        console.error('Error stopping sound:', error);
      } finally {
        setPlayingSound(null);
      }
    }
  }, [playingSound]);

  return (
    <AudioContext.Provider value={{ playingSound, setPlayingSound, stopPlayingSound }}>
      {children}
    </AudioContext.Provider>
  );
};