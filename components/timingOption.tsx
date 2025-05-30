import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/Colors';
import TimingBellActive from '../assets/svg/TimingBellActiveSvg';
import TimingBellUnactiveSvg from '../assets/svg/TimingBellUnactiveSvg';
import { useGlobalContext } from '../context/GlobalProvider';
import StandarButton from './StandarBtn';
import { ThemedText } from './ThemedText';
import { useTheme } from '../context/ThemeContext';

type TimingOptionProps = {
  name: string;
  time: string;
  focus: boolean;
  active: boolean;
};

const formatTime = (timestamp: number, is12HourFormat: boolean) => {
  const date = new Date(timestamp);
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: is12HourFormat ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12: is12HourFormat,
    hourCycle: is12HourFormat ? 'h12' : 'h23'
  });
  return formattedTime
};

export default function TimingOption({ name, data, focus, timeRemaining }: TimingOptionProps) {
  const { theme } = useTheme();
  const { useSlidebar, setSlidebarSelected, is12HourPrayerTimeFormatEnabled, setTimingSelected, notificationStatus } = useGlobalContext(); 
  return (
    <StandarButton
      onPress={() => {
        useSlidebar();
        setSlidebarSelected('Timing');
        setTimingSelected(data);
      }}
      style={[
        styles.container,
        { borderColor: focus ? Colors[theme].timingActive : Colors[theme].TimingOption },
      ]}
    >
      <View style={{alignItems:'center', flexDirection:'row'}}>
        <Text style={[styles.name, { color: focus ? Colors[theme].timingActive : Colors[theme].TimingOption }]}>
          {name}
        </Text>
        {focus ?
          <ThemedText style={[styles.timeRemaining,{color:theme === 'light' ? Colors[theme].timingActive : '#FFF'}]}>
            {timeRemaining}
          </ThemedText>
          : ''}
      </View>
      <View>
        <View style={styles.rigtCont}>
          <Text
            style={[styles.timeText, { color: focus ? Colors[theme].timingActive : Colors[theme].TimingOption }]}
          >
            {formatTime(data.timestamp, is12HourPrayerTimeFormatEnabled)}

          </Text>
          {notificationStatus[name].status != 'unactive' ? (
            <TimingBellActive fill={focus ? Colors[theme].timingActive : Colors[theme].TimingOption} />
          ) : (
            <TimingBellUnactiveSvg fill={focus ? Colors[theme].timingActive : Colors[theme].TimingOption} />
          )}
        </View>
      </View>
    </StandarButton>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 7,
    marginBottom: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  rigtCont: {
    flexDirection: 'row',
  },
  timeRemaining: {
    fontSize: 12,
    opacity: .5,
    marginLeft: 20
  }
});
