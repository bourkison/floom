import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import HomeAuth from '@/screens/Auth/HomeAuth';
import Login from '@/screens/Auth/Login';
import SignUp from '@/screens/Auth/SignUp';
import Home from '@/screens/Main/Home';
import {useAppSelector} from '@/store/hooks';

export type AuthStackParamList = {
    HomeAuth: undefined;
    GuestWelcome: undefined;
    SignUp: {
        startPageIndex: number;
    };
    Login: undefined;
};

export type MainStackParamList = {
    Home: undefined;
};

const MainStack = createStackNavigator<MainStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

export default function Navigator() {
    const loggedIn = useAppSelector(state => state.user.loggedIn);

    if (!loggedIn) {
        return (
            <AuthStack.Navigator initialRouteName="HomeAuth">
                <AuthStack.Screen
                    name="HomeAuth"
                    component={HomeAuth}
                    options={{headerShown: false}}
                />
                <AuthStack.Screen
                    name="SignUp"
                    component={SignUp}
                    initialParams={{startPageIndex: 0}}
                    options={{headerShown: false /*gestureEnabled: false*/}}
                />
                <AuthStack.Screen
                    name="Login"
                    component={Login}
                    options={{headerShown: false}}
                />
            </AuthStack.Navigator>
        );
    }

    return (
        <MainStack.Navigator initialRouteName="Home">
            <MainStack.Screen name="Home" component={Home} />
        </MainStack.Navigator>
    );
}
