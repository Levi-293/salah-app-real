import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { PlayerOption } from '../../components/PlayerOption';
import { useTheme } from '../../context/ThemeContext';
import { useGlobalContext } from '../../context/GlobalProvider';
import { err } from 'react-native-svg';
import logger from '@/utils/logger';

const MemoizedPlayerOption = React.memo(PlayerOption);

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { categories } = useGlobalContext();

  const handleCategoryPress = useCallback((categoryId: string, categoryName: string, categoryType: string, madhabType: string) => {
    if (categoryType === 'instruction with madhab') {
        logger.debug('instruction with madhab',{ params: { categoryId, categoryName }})
          router.push({
        pathname: '/instruction_list_with_madhab',
        params: { categoryId, categoryName }
      });
    } else if (categoryType === 'instruction') {
        logger.debug('instruction only',{ params: { categoryId, categoryName }})
          router.push({
            pathname: '/instruction_list',
        params: { categoryId, categoryName }
      });
    } else if (categoryType === 'dua') {
        logger.debug('dua',{ params: { categoryId, categoryName }})
        router.push({
        pathname: '/dua_list',
        params: { categoryId, categoryName }
      });
    } else {
      console.error('Invalid category type:', categoryType);
    }
  }, [router]);

  useLayoutEffect(()=>{
    logger.info('Player screen is loaded')
  },[])

  const renderCategories = useMemo(() => (
    categories.map((category) => (
      <TouchableOpacity
        key={category.id}
        onPress={() => handleCategoryPress(category.id, category.name, category.type, category.type)}
      >
        <MemoizedPlayerOption
          img={category.image}
          backgroundColor={category.color}
          title={category.name}
          subtitle={category.description}
        />
      </TouchableOpacity>
    ))
  ), [categories, handleCategoryPress]);

  if (categories.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <ActivityIndicator size="large" color={Colors[theme].text} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <ThemedView>
        <View style={styles.mainTitle}>
          <ThemedText type='title'>
            Salah Essentials
          </ThemedText>
        </View>
        <ScrollView style={styles.mainCont}>
          <View style={styles.categoriesContainer}>
            {renderCategories}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainTitle: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 23,
    textAlign: 'center',
    alignItems: 'center',
  },
  mainCont: {
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  categoriesContainer: {
    paddingBottom: 75,
  },
});