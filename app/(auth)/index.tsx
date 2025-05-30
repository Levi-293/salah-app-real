// Componente AuthIndex
import React, { useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ThemedView } from '../../components/ThemedView';
import Onboarding from '../../components/onboardingComponents/onboarding';
import Pragnator from '../../components/Pragnator';
import AssalamuSvg from '../../assets/svg/AssalamuSvg';
import PrivateSvg from '../../assets/svg/PrivateSvg';
import LocationStart from '../../components/onboardingComponents/Location';
import NotificationsStart from '../../components/onboardingComponents/Notifications';
import Madhab from '../../components/onboardingComponents/Madhab';
import { useGlobalContext } from '../../context/GlobalProvider';
import { useTheme } from '../../context/ThemeContext';
import * as Location from 'expo-location';

export default function AuthIndex() {
    const { theme } = useTheme();
    const router = useRouter();
    const [position, setPosition] = useState(0);
    const [currentSvg, setCurrentSvg] = useState(position);
    const [isAnimating, setIsAnimating] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const translateX = useRef(new Animated.Value(0)).current;
    const { 
        onBoardingBtnText, 
        setOnBoardingBtnText,
        onBoardingBtnDisabled, 
        setOnBoardingBtnDisabled,
        setSlidebarSelected,
        setSlidebarActive
    } = useGlobalContext();

    const handleComplete = async () => {
        await AsyncStorage.setItem('isFirstTime', 'false');
        // Always show the location sidebar after onboarding
        setSlidebarSelected('locationNotAllowed');
        setSlidebarActive(true);
        router.replace('/(tabs)/');

    };

    const handleChange = () => {
        if (isAnimating) return;
        if (!locationEnabled && currentSvg === 2){
            setLocationEnabled(true)
            return;
        }
        if (!notificationsEnabled && currentSvg === 3){
            setNotificationsEnabled(true)
            return;
        }
        setOnBoardingBtnText('Next')
        if (position + 1 === data.length) {
            handleComplete();
        } else {
            setIsAnimating(true);
            const nextPosition = (position + 1) % data.length;

            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: -390, // Adjust as needed based on your SVG width
                    duration: 150, // Faster duration
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(new Animated.Value(0), {
                    toValue: 1,
                    duration: 150,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                })
            ]).start(() => {
                setPosition(nextPosition);
                setCurrentSvg(nextPosition);
                translateX.setValue(390); 

                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 150, // Faster duration
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }).start(() => setIsAnimating(false));
            });
        }
    };

    const data = [
        {
            title: 'Assalamu alaykum',
            text: 'A user-friendly, privacy-focused & beautifully designed app for Muslims.',
            autopilot: false
        },
        {
            title: 'Private & Ad-Free',
            text: 'Muslims are entitled to their privacy. That’s why personal data, including your location, never leaves your phone. Our app is completely ad-free.',
            autopilot: false
        },
        {
            title: 'Location',
            text: 'Enable location permissions to find your local prayer times & calculate Qibla directions. Enable notifications permissions to receive alerts. Locations data are fully secure.',
            autopilot: true
        },
        {
            title: 'Notifications',
            text: 'Enable notifications to receive prayer alerts and customize which prayers you receive alerts for.',
            autopilot: false
        },
        {
            title: 'The Four Imams Madhab (School of Thought)',
            text: 'Your Madhab (school of thought) determines whether you follow the earlier or later Asr times. More calculation options are available.',
            autopilot: false
        }
    ];

    const renderSvg = () => {
        switch (currentSvg) {
            case 0:
                return <AssalamuSvg fill={Colors[theme].focusColor} />;
            case 1:
                return <PrivateSvg fill={Colors[theme].focusColor} />;
            case 2:
                return <LocationStart onLocationStartChange={locationEnabled} />;
            case 3:
                return <NotificationsStart onNotificationStartChange={notificationsEnabled}/>;
            case 4:
                return <Madhab />;
            default:
                return <AssalamuSvg fill={Colors[theme].focusColor} />;
        }
    };

    return (
        <SafeAreaView style={[{ backgroundColor: Colors[theme].background, flex: 1, width: '100%' }]}>
            <ThemedView style={styles.container}>
                <Onboarding
                    onClick={() => {
                        if (!onBoardingBtnDisabled) {
                            handleChange();
                        }
                    }}
                    title={data[position].title}
                    text={data[position].text}
                    autopilot={data[position].autopilot}
                    btn={onBoardingBtnText}
                    disabled={onBoardingBtnDisabled}
                >
                    <Animated.View style={{ transform: [{ translateX }], width: '100%', alignItems: 'center' }}>
                        {renderSvg()}
                    </Animated.View>
                </Onboarding>
                <Pragnator cantity={data.length} position={position} />
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 10
    },
});
