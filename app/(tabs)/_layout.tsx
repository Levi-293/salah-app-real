import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import { View, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { TabBarIcon } from '../../components/navigation/TabBarIcon';
import { Colors } from '../../constants/Colors';
import SlidebarControler from '../../components/slidebarComponents/slidebarControler';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const pathname = usePathname();

  const getStatusBarColor = () => {
    if (pathname === '/index' && theme === 'light') {
      return '#3DB2EB';
    } else {
      return theme === 'light' ? '#FFF' : '#053529';
    }
  };

  const statusBarColor = getStatusBarColor();
  
  // Tab bar and footer color will now be the same
  const footerBackgroundColor = theme === 'light' ? '#FFF' : '#053529'; // Adjust based on light/dark theme

  const styles = {
    footer: {
      backgroundColor: footerBackgroundColor, // Apply footer background color
      height: 85,
      paddingBottom: 15,
      paddingTop: 15,
      justifyContent: 'center',
      alignItems: 'center',
      borderTopLeftRadius: 20,  // Add rounded corner to top left
      borderTopRightRadius: 20, // Add rounded corner to top right
      borderTopWidth: 0,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 56,
        },
      }),
    },
    container: {
      flex: 1,
      backgroundColor: footerBackgroundColor, // Set background color for the container
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    tabBarItem: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabBarLabel: {
      fontSize: 12,
      marginTop: -2,
    },
  };

  return (
    <SafeAreaProvider>
      <SafeAreaInsetsContext.Consumer>
        {insets => (
          <View
            style={[
              styles.container, // Set the entire container's background color to match the footer
              { paddingBottom: insets?.bottom || 0 }
            ]}
          >
            <StatusBar 
              barStyle={theme === 'light' ? 'dark-content' : 'light-content'} 
              backgroundColor={statusBarColor} 
            />
            <SlidebarControler />
            <Tabs
              screenOptions={{
                tabBarActiveTintColor: Colors[theme].tint,
                headerShown: false,
                tabBarStyle: styles.footer, // Style the tab bar with the same footer color
                tabBarItemStyle: styles.tabBarItem,
                tabBarLabelStyle: styles.tabBarLabel,
              }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: 'Timing',
                  tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'timing' : 'timing-outline'} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="player"
                options={{
                  title: 'Prayer',
                  tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'player' : 'player-outline'} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="qibla"
                options={{
                  title: 'Qibla',
                  tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'Qibla' : 'Qibla-outline'} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="setting"
                options={{
                  title: 'Setting',
                  tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
                  ),
                }}
              />
            </Tabs>
          </View>
        )}
      </SafeAreaInsetsContext.Consumer>
    </SafeAreaProvider>
  );
}