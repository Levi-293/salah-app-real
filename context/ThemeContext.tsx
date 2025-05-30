import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

// Mantenemos visible el splash hasta que cargue el tema
SplashScreen.preventAutoHideAsync();

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isDarkTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  // Cargar el tema guardado en AsyncStorage al iniciar la app
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setIsDarkTheme(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Error al cargar el tema:', error);
      } finally {
        // Una vez que el tema ha cargado, podemos ocultar el splash screen
        setIsAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    loadTheme();
  }, []);

  // Alternar y guardar el tema en AsyncStorage
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkTheme ? 'dark' : 'light';
      await AsyncStorage.setItem('theme', newTheme);
      setIsDarkTheme(!isDarkTheme);
    } catch (error) {
      console.error('Error al guardar el tema:', error);
    }
  };

  const theme = isDarkTheme ? 'dark' : 'light';

  if (!isAppReady) {
    return null; // No renderizamos la UI hasta que la app esté lista
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
