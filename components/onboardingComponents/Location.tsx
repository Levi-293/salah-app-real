import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import LocationSvg from '../../assets/svg/LocationSvg';
import LitTlePlane from '../../assets/svg/LitTlePlane';
import { useGlobalContext } from '../../context/GlobalProvider';
import { useTheme } from '../../context/ThemeContext';
import LocationService from '../../components/services/LocationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LocationStart({ onLocationStartChange }) {
    const { theme } = useTheme();
    const { setOnBoardingBtnText, setOnBoardingBtnDisabled, setLocationAllowed, setSlidebarActive, initializeData } = useGlobalContext();
    const [location, setLocation] = useState("");

    useEffect(() => {
        setOnBoardingBtnText('Continue');
        if (onLocationStartChange) {
            getLocation();
        }
    }, [onLocationStartChange]);

    const getLocation = async () => {
        setOnBoardingBtnDisabled(true);
        setOnBoardingBtnText('Fetching location...');
      
        try {
            const locationData = await LocationService.getLocation();
            setLocationAllowed(true);
            setSlidebarActive(false);
            setLocation(locationData.city);
            setOnBoardingBtnText('Next');
            initializeData();
        } catch (error) {
            setLocation('Can not fetch location');
            setOnBoardingBtnText('Skip Location');
        } finally {
            setOnBoardingBtnDisabled(false);
        }
    };

    return (
        <View style={styles.mainCont}>
            <LocationSvg fill={Colors[theme].focusColor} />
            <View style={[styles.locationCont, { backgroundColor: Colors[theme].opacityBtn }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText style={styles.first}>Location </ThemedText>
                    <LitTlePlane fill={Colors[theme].textColor} />
                </View>
                <ThemedText style={styles.second}>{location || 'Enable Location services'}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainCont: {
        flex: 1,
        width: '100%',
    },
    locationCont: {
        borderRadius: 8,
        height: 49,
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    first: {
        fontSize: 12,
        fontWeight: '600',
        marginRight: 3,
        opacity: 0.5,
    },
    second: {
        fontSize: 16,
        fontWeight: '600',
        opacity: 0.5,
    },
});