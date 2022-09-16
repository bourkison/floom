import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Swipe from '@/screens/Swipe';

const Tab = createBottomTabNavigator();

const Navigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={Swipe} />
        </Tab.Navigator>
    );
};

export default Navigator;
