import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

interface PlayerOptionProps {
  title: string;
  subtitle: string;
  backgroundColor: string;
  img: string;
}

export function PlayerOption({ title, subtitle, backgroundColor, img }: PlayerOptionProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: Colors[theme].PlayerText }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: Colors[theme].PlayerText }]}>{subtitle}</Text>
      </View>
      <View style={styles.imgCont}>
        <Image 
          source={{ uri: img }} 
          style={styles.image} 
          contentFit="contain"
          transition={1000}
          onError={(e) => console.log('Image loading error:', e.nativeEvent.error, 'URL:', img)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 119,
    borderRadius: 12.5,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingTop: 22,
    paddingLeft: 19,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15.54,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 11.66,
    fontWeight: '600',
    maxWidth: 110,
  },
  imgCont: {
    marginRight: 20,
    height: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});