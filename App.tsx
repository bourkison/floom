import {NavigationContainer} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';

import AppLoader from '@/AppLoader';
import Navigator from '@/nav/Navigator';
import store from '@/store';

SplashScreen.preventAutoHideAsync();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    return (
        <View onLayout={onLayoutRootView} style={styles.flexOne}>
            <Provider store={store}>
                <SafeAreaProvider>
                    <GestureHandlerRootView style={styles.flexOne}>
                        <AppLoader
                            appIsReady={appIsReady}
                            setAppIsReady={setAppIsReady}>
                            <NavigationContainer>
                                <StatusBar style="dark" />
                                <Navigator />
                            </NavigationContainer>
                        </AppLoader>
                    </GestureHandlerRootView>
                </SafeAreaProvider>
            </Provider>
        </View>
    );
}

const styles = StyleSheet.create({
    flexOne: {
        flex: 1,
    },
});
