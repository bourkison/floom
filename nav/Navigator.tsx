import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import HomeAuth from '@/screens/Auth/HomeAuth';
import Login from '@/screens/Auth/Login';
import SignUp from '@/screens/Auth/SignUp';

export type AuthStackParamList = {
    HomeAuth: undefined;
    GuestWelcome: undefined;
    SignUp: undefined;
    VerifyEmail: {
        username: string;
        password: string;
        sendCodeOnLoad?: boolean;
    };
    Login: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();

export default function Navigator() {
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
