import {
    CardStyleInterpolators,
    createStackNavigator,
} from '@react-navigation/stack';
import React from 'react';

import BottomSheetProvider from '@/context/BottomSheet/BottomSheetProvider';
import AnimatedProductProvider from '@/context/animated/AnimatedProductProvider';
import DeletedProvider from '@/context/deleted/DeletedProvider';
import SavedProvider from '@/context/saved/SavedProvider';
import FiltersNavigator from '@/nav/FiltersNavigator';
import {HEADER_HEIGHT_W_STATUS_BAR, HomeHeader} from '@/nav/Headers';
import OptionsNavigator from '@/nav/OptionsNavigator';
import SavedNavigator from '@/nav/SavedNavigator';
import {RootStackParamList} from '@/types/nav';
import HomeAuth from '@/screens/Auth/HomeAuth';
import Login from '@/screens/Auth/Login';
import SignUp from '@/screens/Auth/SignUp';
import Home from '@/screens/Main/Home';
import ProductView from '@/screens/Main/ProductView';
import {useAppSelector} from '@/store/hooks';

const MainStack = createStackNavigator<RootStackParamList>();

export default function Navigator() {
    const loggedIn = useAppSelector(state => state.user.loggedIn);

    return (
        <SavedProvider>
            <DeletedProvider>
                <BottomSheetProvider>
                    <AnimatedProductProvider>
                        <MainStack.Navigator
                            initialRouteName="Home"
                            screenOptions={{
                                cardStyleInterpolator:
                                    CardStyleInterpolators.forHorizontalIOS,
                                gestureEnabled: true,
                                headerStyle: {
                                    height: HEADER_HEIGHT_W_STATUS_BAR,
                                    elevation: 999,
                                    zIndex: 999,
                                },
                            }}>
                            {!loggedIn ? (
                                <>
                                    <MainStack.Screen
                                        name="HomeAuth"
                                        component={HomeAuth}
                                        options={{headerShown: false}}
                                    />
                                    <MainStack.Screen
                                        name="SignUp"
                                        component={SignUp}
                                        initialParams={{startPageIndex: 0}}
                                        options={{
                                            headerShown:
                                                false /*gestureEnabled: false*/,
                                        }}
                                    />
                                    <MainStack.Screen
                                        name="Login"
                                        component={Login}
                                        options={{headerShown: false}}
                                    />
                                </>
                            ) : (
                                <>
                                    <MainStack.Screen
                                        name="Home"
                                        component={Home}
                                        options={{header: HomeHeader}}
                                    />
                                    <MainStack.Screen
                                        name="Filters"
                                        component={FiltersNavigator}
                                        options={{
                                            gestureDirection: 'vertical',
                                            headerShown: false,
                                            gestureEnabled: false,
                                            cardStyleInterpolator:
                                                CardStyleInterpolators.forVerticalIOS,
                                        }}
                                    />
                                    <MainStack.Screen
                                        name="ProductView"
                                        component={ProductView}
                                        options={{
                                            cardStyleInterpolator:
                                                CardStyleInterpolators.forVerticalIOS,
                                            gestureDirection: 'vertical',
                                            headerShown: false,
                                            gestureEnabled: true,
                                        }}
                                    />
                                    <MainStack.Screen
                                        name="SavedProducts"
                                        component={SavedNavigator}
                                        options={{
                                            gestureDirection: 'horizontal',
                                            gestureEnabled: true,
                                            headerShown: false,
                                        }}
                                    />
                                    <MainStack.Screen
                                        name="Options"
                                        component={OptionsNavigator}
                                        options={{
                                            gestureDirection:
                                                'horizontal-inverted',
                                            headerShown: false,
                                            gestureEnabled: true,
                                        }}
                                    />
                                </>
                            )}
                        </MainStack.Navigator>
                    </AnimatedProductProvider>
                </BottomSheetProvider>
            </DeletedProvider>
        </SavedProvider>
    );
}
