import {useFonts} from 'expo-font';
import React, {useEffect, useState} from 'react';

import {supabase} from '@/services/supabase';
import {useAppDispatch} from '@/store/hooks';
import {login, logout} from '@/store/slices/user';

type AppLoaderProps = {
    children: React.JSX.Element;
    appIsReady: boolean;
    setAppIsReady: (val: boolean) => void;
};

export default function AppLoader({
    children,
    appIsReady,
    setAppIsReady,
}: AppLoaderProps) {
    const dispatch = useAppDispatch();
    const [userLoaded, setUserLoaded] = useState(false);

    // LOAD FONTS
    const [fontsLoaded] = useFonts({
        'Gilroy-ExtraBold': require('@/assets/fonts/Gilroy-ExtraBold.otf'),
        'Gilroy-Light': require('@/assets/fonts/Gilroy-Light.otf'),
        'Philosopher-Bold': require('@/assets/fonts/Philosopher-Bold.ttf'),
        'JosefinSans-Light': require('@/assets/fonts/JosefinSans-Light.ttf'),
        'JosefinSans-Regular': require('@/assets/fonts/JosefinSans-Regular.ttf'),
    });

    // LOAD USER
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
                .eq('id', user.id)
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

            console.log('USER DATA', data);
            dispatch(login(data));
            setUserLoaded(true);
        };

        initFetch();
    }, []);

    useEffect(() => {
        if (fontsLoaded && userLoaded) {
            setAppIsReady(true);
        }
    }, [fontsLoaded, userLoaded]);

    if (!appIsReady) {
        return null;
    }

    return children;
}
