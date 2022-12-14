import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useAppSelector} from '@/store/hooks';
import {Product as ProductType} from '@/types/product';

import Home from '@/screens/Swipe/Home';
import SavedProducts from '@/screens/Swipe/SavedProducts';
import ProductView from '@/screens/Swipe/ProductView';

import HomeAuth from '@/screens/Auth/HomeAuth';
import GuestWelcome from '@/screens/Auth/GuestWelcome';
import SignUp from '@/screens/Auth/SignUp';
import VerifyEmail from '@/screens/Auth/VerifyEmail';
import Login from '@/screens/Auth/Login';

import {
    HomeHeader,
    LoginHeader,
    SavedProductsHeader,
    SignUpHeader,
} from '@/nav/Headers';
import OptionsNavigator from '@/nav/OptionsNavigator';

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
    Home?: {
        imageIndex?: number;
    };
    Options: undefined;
    SavedProducts: undefined;
    ProductView: {
        product: ProductType;
        imageIndex?: number;
    };
};

const MainStack = createStackNavigator<MainStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

const Navigator = () => {
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
                    name="GuestWelcome"
                    component={GuestWelcome}
                    options={{gestureEnabled: true}}
                />
                <AuthStack.Screen
                    name="SignUp"
                    component={SignUp}
                    options={{
                        header: SignUpHeader,
                        gestureEnabled: true,
                    }}
                />
                <AuthStack.Screen name="VerifyEmail" component={VerifyEmail} />
                <AuthStack.Screen
                    name="Login"
                    component={Login}
                    options={{header: LoginHeader, gestureEnabled: true}}
                />
            </AuthStack.Navigator>
        );
    }

    return (
        <MainStack.Navigator initialRouteName="Home">
            <MainStack.Screen
                name="Home"
                component={Home}
                options={{
                    header: HomeHeader,
                }}
            />
            <MainStack.Screen
                name="Options"
                component={OptionsNavigator}
                options={{
                    gestureDirection: 'horizontal-inverted',
                    headerShown: false,
                    gestureEnabled: true,
                }}
            />
            <MainStack.Screen
                name="SavedProducts"
                component={SavedProducts}
                options={{
                    gestureDirection: 'horizontal',
                    header: SavedProductsHeader,
                    gestureEnabled: true,
                }}
            />
            <MainStack.Screen
                name="ProductView"
                component={ProductView}
                options={{
                    presentation: 'modal',
                    gestureDirection: 'vertical',
                    headerShown: false,
                    gestureEnabled: true,
                }}
            />
        </MainStack.Navigator>
    );
};

export default Navigator;
