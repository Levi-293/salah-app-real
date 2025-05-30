import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import StandarButton from '../StandarBtn';
import { useTheme } from '../../context/ThemeContext';

export default function Onboarding({ title, autopilot, text, children, onClick, btn, disabled }) {
    const { theme } = useTheme();
    const backgroundColor = theme === 'light'
        ? 'rgba(223, 223, 223, .7)'
        : 'rgba(255, 255, 255, .5)';

    return (
        <View style={styles.mainCont}>
            <View style={{alignItems:'center', height:68, }}>
                <ThemedText style={styles.title}>{title}</ThemedText>
                {autopilot && <ThemedText style={[styles.autopilot,{backgroundColor:backgroundColor}]}>AUTOPILOT</ThemedText>}
            </View>
            <ScrollView style={{ flex: 1 }}>
                <View style={{ flex: 1, paddingTop: 50, alignItems: 'center' }}>
                    {children}
                </View>
            </ScrollView>
            <View>
                <ThemedText style={styles.text} >
                    {text}
                </ThemedText>
                <StandarButton 
                    onPress={() => {
                        if (!disabled) {
                            onClick();
                        }
                    }}
                    style={[
                        styles.nextBtn, 
                        { backgroundColor: Colors[theme].focusColor },
                        disabled && styles.disabledButton
                    ]}
                    disabled={disabled}
                >
                    <Text style={[styles.nextText, disabled && styles.disabledText]}>{btn}</Text>
                </StandarButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainCont: {
        flex: 1,
        paddingTop: 12,
        width: '100%',
    },
    autopilot:{
        fontSize:18,
        fontWeight:'600',
        opacity:.5,
        paddingHorizontal:8,
        paddingVertical:5,
        borderRadius:4
    },
    title: {
        fontSize: 20,
        marginBottom: 5,
        fontWeight: '700',
        textAlign: 'center'
    },
    nextBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 48,
        borderRadius: 12,
        marginBottom: 30,
        marginTop: 14
    },
    nextText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center'
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledText: {
        color: 'rgba(255, 255, 255, 0.7)',
    }
});