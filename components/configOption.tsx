import { Link } from 'expo-router';
import { type ComponentProps, ReactNode } from 'react';
import { Share , Text, View, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemedText } from '../components/ThemedText';
import { useGlobalContext } from '../context/GlobalProvider';
import StandarButton from './StandarBtn';
import { useTheme } from '../context/ThemeContext';
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

interface ConfigOptionProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  icon?: ReactNode;
  button?: string;
  secondButton?: string;
}

export function ConfigOption({
  title,
  subtitle,
  center,
  icon,
  button,
  secondButton,
}: ConfigOptionProps) {
  const { theme } = useTheme();
  const { useSlidebar, setSlidebarSelected } = useGlobalContext();

  const handlePress = () => {
    if (title === 'Share the reward') {
      Share.share({
        message: 
      `Salam! 
      
Check out this prayer app! It offers:

- Prayer times
- Step-by-step prayer guide
- Reminders 
- And much more!

Download it here:

Android: https://play.google.com/store/apps/details?id=com.aburuqayyah.salah

iOS: https://apps.apple.com/us/app/salah-guide-app/id6737063241`,
      });
    } else {
      if (!button) {
        useSlidebar();
        setSlidebarSelected(title);
      }
    }
  };

  return (
    <StandarButton
      onPress={handlePress}
      style={[styles.container, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor }]}
      activeOpacity={button ? 1 : 0.2}
    >
      <View style={styles.titleCont}>
        <View style={styles.svgCont}>{icon}</View>
        <ThemedText
          style={[
            styles.title,
            center ? styles.titleCenter : undefined,
            { color: Colors[theme].configSvg }
          ]}
          type='defaultSemiBold'
        >
          {title}
        </ThemedText>
      </View>
      {subtitle && (
        <ThemedText style={styles.subtitle} type='opacitySemiBold'>
          {subtitle}
        </ThemedText>
      )}

      <View style={styles.buttonCont}>
        {button && (
          <>
            <StandarButton
              onPress={() => { useSlidebar(); setSlidebarSelected(title); }}
              style={[styles.button, { backgroundColor: Colors[theme].focusColor }]}
            >
              <Text style={{ color: Colors[theme].buttonText }}>{button}</Text>
            </StandarButton>

            {secondButton && (
              <StandarButton
              onPress={() => { useSlidebar(); setSlidebarSelected(title); }}
                style={[
                  styles.button,
                  { borderColor: Colors[theme].focusColor, borderWidth: 1, marginLeft: 8 },
                ]}
              >
                <Text style={{ color: Colors[theme].focusColor }}>{secondButton}</Text>
              </StandarButton>
            )}
          </>
        )}
      </View>
    </StandarButton>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  buttonCont: {
    flexDirection: 'row',
  },
  titleCont: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 8,
  },
  titleCenter: {
    flex: 1,
    textAlign: 'center',
    paddingRight: 24,
  },
  svgCont: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    height: 32,
    padding: 5,
    marginTop: 8,
    minWidth: 83,
  },
});
