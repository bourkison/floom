import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useAppSelector} from '@/store/hooks';
import {Product as ProductType} from '@/types/product';

import Home from '@/screens/Swipe/Home';
import Options from '@/screens/Swipe/Options';
import LikedProducts from '@/screens/Swipe/LikedProducts';
import ProductView from '@/screens/Swipe/ProductView';

import HomeAuth from '@/screens/Auth/HomeAuth';
import GuestWelcome from '@/screens/Auth/GuestWelcome';
import SignUp from '@/screens/Auth/SignUp';
import VerifyEmail from '@/screens/Auth/VerifyEmail';
import Login from '@/screens/Auth/Login';

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

export type MainStackParamList = {
    Home: undefined;
    Options: undefined;
    LikedProducts: undefined;
    ProductView: {
        product: ProductType;
    };
};

const MainStack = createStackNavigator<MainStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

const Navigator = () => {
    const loggedIn = useAppSelector(state => state.user.loggedIn);

    if (!loggedIn) {
        return (
            <AuthStack.Navigator initialRouteName="HomeAuth">
                <AuthStack.Screen name="HomeAuth" component={HomeAuth} />
                <AuthStack.Screen
                    name="GuestWelcome"
                    component={GuestWelcome}
                />
                <AuthStack.Screen name="SignUp" component={SignUp} />
                <AuthStack.Screen name="VerifyEmail" component={VerifyEmail} />
                <AuthStack.Screen name="Login" component={Login} />
            </AuthStack.Navigator>
        );
    }

    return (
        <MainStack.Navigator initialRouteName="Home">
            <MainStack.Screen name="Home" component={Home} />
            <MainStack.Screen
                name="Options"
                component={Options}
                options={{
                    gestureDirection: 'horizontal-inverted',
                }}
            />
            <MainStack.Screen
                name="LikedProducts"
                component={LikedProducts}
                options={{
                    gestureDirection: 'horizontal',
                }}
            />
            <MainStack.Screen
                name="ProductView"
                component={ProductView}
                options={{
                    presentation: 'modal',
                    gestureDirection: 'vertical',
                    headerShown: false,
                }}
            />
        </MainStack.Navigator>
    );
};

export default Navigator;
