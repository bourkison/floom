import {NavigationContainer} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';

import AppLoader from '@/AppLoader';
import SavedProvider from '@/context/saved/SavedProvider';
import Navigator from '@/nav/Navigator';
import store from '@/store';

SplashScreen.preventAutoHideAsync();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        if (appIsReady) {
            SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <GestureHandlerRootView style={styles.flexOne}>
                    <AppLoader
                        appIsReady={appIsReady}
                        setAppIsReady={setAppIsReady}>
                        <SavedProvider>
                            <NavigationContainer>
                                <StatusBar style="dark" />
                                <Navigator />
                            </NavigationContainer>
                        </SavedProvider>
                    </AppLoader>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </Provider>
    );
}

const styles = StyleSheet.create({
    flexOne: {
        flex: 1,
    },
});
