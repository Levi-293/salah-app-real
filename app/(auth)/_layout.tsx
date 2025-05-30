import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import { View, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { TabBarIcon } from '../../components/navigation/TabBarIcon';
import { Colors } from '../../constants/Colors';
import SlidebarControler from '../../components/slidebarComponents/slidebarControler';
import { useTheme } from '../../context/ThemeContext';
import { useGlobalContext } from '../../context/GlobalProvider';

export default function TabLayout() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const { slidebarActive } = useGlobalContext();

  const getStatusBarColor = () => {
    if (pathname === '/index' && theme === 'light') {
      return '#3DB2EB';
    } else {
      return theme === 'light' ? '#FFF' : '#053529';
    }
  };

  const statusBarColor = getStatusBarColor();

  return (
    <SafeAreaProvider>
      <SafeAreaInsetsContext.Consumer>
        {insets => (
          <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, paddingBottom: insets?.bottom || 0 }}>

            <StatusBar 
              barStyle={theme === 'light' ? 'dark-content' : 'light-content'} 
              backgroundColor={statusBarColor} 
            />
            {/* Only show the slidebar when explicitly activated, not during initial onboarding */}
            {pathname !== '/index' || slidebarActive ? <SlidebarControler /> : null}
            <Tabs
              screenOptions={{
                tabBarActiveTintColor: Colors[theme].tint,
                headerShown: false,
                tabBarStyle: { display: 'none' }, // Oculta las tabs
              }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: 'index',
                  tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'timing' : 'timing-outline'} color={color} />
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
