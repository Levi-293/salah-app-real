/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#14B17F';
const tintColorDark = '#FF9141';

export const Colors = {
  light: {
    opacityBtn:'rgba(0,0,0,.05)',
    configSvg:'rgba(0,0,0,.6)',
    borderColor:'#C0C2C2',
    text: '#11181C',
    background: '#FFF',
    tint: tintColorLight,
    icon: '#687076',
    focusColor: '#14B17F',
    buttonText: 'rgba(255,255,255,.8)',
    tabIconSelected: tintColorLight,
    PlayerText:'#0D2020',
    TimingOption:'rgba(0, 0, 0, .4)',
    timingActive:'#14B17F',
    textColor:'#000',
    placeholderColor:'rgba(0, 0, 0, .2)',
    error: '#FF3B30'
  },
  dark: {
    opacityBtn:'#07513E',
    configSvg:'#FFFFFF',
    borderColor:'rgba(0,0,0,.0)',
    text: '#ECEDEE',
    background: '#053529',
    tint: tintColorDark,
    icon: '#053529',
    focusColor: '#FF9141',
    buttonText: '#FFF',
    tabIconSelected: tintColorDark,
    PlayerText:'#04030C',
    TimingOption:'rgba(243, 243, 243, .4)',
    timingActive:'#FFFFFF',
    textColor:'#Fff',
    placeholderColor:'rgba(255, 255, 255, .2)',
    error: '#FF453A'
  },
};
