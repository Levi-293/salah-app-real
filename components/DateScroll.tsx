import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import RigthArrowSvg from '../assets/svg/RigthArrowSvg';
import LeftArrowSvg from '../assets/svg/LeftArrowSvg';
import { Colors } from '../constants/Colors';
import ScrollComp from './ScrollComp';
import { useGlobalContext } from '../context/GlobalProvider';
import { useTheme } from '../context/ThemeContext';

const ITEM_WIDTH = 60; // Adjust this value based on your ScrollComp width

export default function DateScroll({ onDateChange }) {
  const { setDateSelected, setIndexDateSelected, indexDateSelected, allDates } = useGlobalContext();
  const { theme } = useTheme();
  const flatListRef = useRef(null);
  const [isLeftDisabled, setIsLeftDisabled] = useState(true);
  const [isRightDisabled, setIsRightDisabled] = useState(false);

  const handleDateClick = (index) => {
    setIndexDateSelected(index);
    setDateSelected(allDates[index].fullDate);
    scrollToIndex(index);
    onDateChange(index);
  };

  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    updateArrowStates(index);
  };

  const updateArrowStates = (index) => {
    setIsLeftDisabled(index === 0);
    setIsRightDisabled(index === allDates.length - 1);
  };

  const handleArrowPress = (direction) => {
    const newIndex = direction === 'left' ? indexDateSelected - 1 : indexDateSelected + 1;
    if (newIndex >= 0 && newIndex < allDates.length) {
      handleDateClick(newIndex);
    }
  };

  useEffect(() => {
    onDateChange();
    updateArrowStates(indexDateSelected);
  }, [indexDateSelected]);

  useEffect(() => {
    // Scroll to the current date (index 7) on initial load
    if (flatListRef.current && allDates.length > 0) {
      scrollToIndex(7);
    }
  }, [allDates]);

  const renderItem = ({ item, index }) => (
    <ScrollComp
      first={item.first}
      second={item.second}
      third={item.third}
      active={indexDateSelected === index}
      onClick={() => handleDateClick(index)}
    />
  );

  const getItemLayout = (_, index) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  });

  return (
    <View style={styles.mainCont}>
      <TouchableOpacity 
        style={styles.arrowCont} 
        onPress={() => handleArrowPress('left')}
        disabled={isLeftDisabled}
      >
        <LeftArrowSvg fill={isLeftDisabled ? Colors[theme].disabledColor : Colors[theme].focusColor} />
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        data={allDates}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        getItemLayout={getItemLayout}
        initialScrollIndex={7}
        initialNumToRender={15}
      />
      <TouchableOpacity 
        style={styles.arrowCont} 
        onPress={() => handleArrowPress('right')}
        disabled={isRightDisabled}
      >
        <RigthArrowSvg fill={isRightDisabled ? Colors[theme].disabledColor : Colors[theme].focusColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowCont: {
    paddingHorizontal: 10,
  },
  listContent: {
    paddingLeft: 10, // Add a small padding to the left
  },
});