import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useAppSelector} from '@/store/hooks';

import Swipe from '@/screens/Swipe';
import HomeAuth from '@/screens/Auth/HomeAuth';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const Navigator = () => {
    const loggedIn = useAppSelector(state => state.user.loggedIn);

    if (!loggedIn) {
        return (
            <Stack.Navigator>
                <Stack.Screen name="Home Auth" component={HomeAuth} />
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
