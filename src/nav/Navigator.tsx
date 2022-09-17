import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useAppSelector} from '@/store/hooks';

import Swipe from '@/screens/Swipe';
import HomeAuth from '@/screens/Auth/HomeAuth';
import GuestWelcome from '@/screens/Auth/GuestWelcome';

export type AuthStackParamList = {
    HomeAuth: undefined;
    GuestWelcome: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<AuthStackParamList>();

const Navigator = () => {
    const loggedIn = useAppSelector(state => state.user.loggedIn);

    if (!loggedIn) {
        return (
            <Stack.Navigator initialRouteName="HomeAuth">
                <Stack.Screen name="HomeAuth" component={HomeAuth} />
                <Stack.Screen name="GuestWelcome" component={GuestWelcome} />
            </Stack.Navigator>
        );
    }

    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={Swipe} />
        </Tab.Navigator>
    );
};

export default Navigator;
