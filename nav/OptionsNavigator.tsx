import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {
    AppInfoHeader,
    DeletedProductsHeader,
    OptionsHeader,
    UpdateDetailHeader,
    HEADER_HEIGHT_W_STATUS_BAR,
} from '@/nav/Headers';
import AppInfo from '@/screens/Options/AppInfo';
import DeletedProducts from '@/screens/Options/DeletedProducts';
import OptionsHome from '@/screens/Options/OptionsHome';
import UpdateDetail from '@/screens/Options/UpdateDetail';
import {OptionsStackParamList} from './types';

const OptionsStack = createStackNavigator<OptionsStackParamList>();

const OptionsNavigator = () => {
    return (
        <OptionsStack.Navigator
            initialRouteName="OptionsHome"
            screenOptions={{
                headerStyle: {
                    height: HEADER_HEIGHT_W_STATUS_BAR,
                },
            }}>
            <OptionsStack.Screen
                name="OptionsHome"
                component={OptionsHome}
                options={{
                    gestureDirection: 'horizontal-inverted',
                    header: OptionsHeader,
                }}
            />
            <OptionsStack.Screen
                name="DeletedProducts"
                component={DeletedProducts}
                options={{
                    header: DeletedProductsHeader,
                }}
            />
            <OptionsStack.Screen
                name="AppInfo"
                component={AppInfo}
                options={{
                    header: AppInfoHeader,
                }}
            />
            <OptionsStack.Screen
                name="UpdateDetail"
                component={UpdateDetail}
                options={{
                    header: UpdateDetailHeader,
                }}
            />
        </OptionsStack.Navigator>
    );
};

export default OptionsNavigator;
