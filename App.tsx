import {NavigationContainer} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';

import Navigator from '@/nav/Navigator';
import {supabase} from '@/services/supabase';
import store from '@/store';
import {useAppDispatch} from '@/store/hooks';
import {login, logout} from '@/store/slices/user';

SplashScreen.preventAutoHideAsync();

export default function App() {
    const dispatch = useAppDispatch();

    const [appIsReady, setAppIsReady] = useState(false);
    const [userLoaded, setUserLoaded] = useState(false);

    const [fontsLoaded] = useFonts({
        'Gilroy-ExtraBold': require('@/assets/fonts/Gilroy-ExtraBold.otf'),
        'Gilroy-Light': require('@/assets/fonts/Gilroy-Light.otf'),
        'Philosopher-Bold': require('@/assets/fonts/Philosopher-Bold.ttf'),
        'JosefinSans-Light': require('@/assets/fonts/JosefinSans-Light.ttf'),
        'JosefinSans-Regular': require('@/assets/fonts/JosefinSans-Regular.ttf'),
    });

    useEffect(() => {
        const initFetch = async () => {
            const {
                data: {user},
            } = await supabase.auth.getUser();

            if (!user) {
                dispatch(logout());
                setUserLoaded(true);
                return;
            }

            const {data, error} = await supabase
                .from('users')
                .select()
                .limit(1)
                .single();

            if (error) {
                console.error(
                    'Error fetching user, though user is logged in. Logging out.',
                );
                await supabase.auth.signOut();
                dispatch(logout());
                setUserLoaded(true);
                return;
            }

            dispatch(login(data));
            setUserLoaded(true);
        };

        initFetch();
    }, []);

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
            <Provider store={store}>
                <SafeAreaProvider>
                    <GestureHandlerRootView style={styles.flexOne}>
                        <NavigationContainer>
                            <StatusBar style="dark" />
                            <Navigator />
                        </NavigationContainer>
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
