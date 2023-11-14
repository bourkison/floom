import {NavigationContainer} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import Navigator from '@/nav/Navigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    const [fontsLoaded] = useFonts({
        'Gilroy-ExtraBold': require('@/assets/fonts/Gilroy-ExtraBold.otf'),
        'Gilroy-Light': require('@/assets/fonts/Gilroy-Light.otf'),
        'Philosopher-Bold': require('@/assets/fonts/Philosopher-Bold.ttf'),
        'JosefinSans-Light': require('@/assets/fonts/JosefinSans-Light.ttf'),
        'JosefinSans-Regular': require('@/assets/fonts/JosefinSans-Regular.ttf'),
    });

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    useEffect(() => {
        if (fontsLoaded) {
            setAppIsReady(true);
        }
    }, [fontsLoaded]);

    if (!appIsReady) {
        return null;
    }

    return (
        <View onLayout={onLayoutRootView} style={styles.flexOne}>
            <SafeAreaProvider>
                <GestureHandlerRootView style={styles.flexOne}>
                    <NavigationContainer>
                        <StatusBar style="dark" />
                        <Navigator />
                    </NavigationContainer>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </View>
    );
}

const styles = StyleSheet.create({
    flexOne: {
        flex: 1,
    },
});
