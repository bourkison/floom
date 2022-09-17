import React, {useEffect, useState, useCallback} from 'react';
import {View} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import Navigator from '@/nav/Navigator';

import {Provider} from 'react-redux';
import store from '@/store';

import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {Amplify} from 'aws-amplify';
import awsconfig from './aws-exports';
import {FETCH_USER} from './store/slices/user';
Amplify.configure(awsconfig);

// Wait until we've finished loading in before hiding splashscreen.
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

const App = () => {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        const initFetch = async () => {
            try {
                await store.dispatch(FETCH_USER());
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        };

        initFetch();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <View onLayout={onLayoutRootView} style={{flex: 1}}>
            <Provider store={store}>
                <GestureHandlerRootView style={{flex: 1}}>
                    <NavigationContainer>
                        <Navigator />
                    </NavigationContainer>
                </GestureHandlerRootView>
            </Provider>
        </View>
    );
};

export default App;
