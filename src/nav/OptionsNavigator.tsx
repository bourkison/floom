import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Options from '@/screens/Options/Options';
import {
    AppInfoHeader,
    DeletedProductsHeader,
    OptionsHeader,
} from '@/nav/Headers';
import DeletedProducts from '@/screens/Options/DeletedProducts';
import AppInfo from '@/screens/Options/AppInfo';

export type OptionsStackParamList = {
    OptionsHome: undefined;
    DeletedProducts: undefined;
    AppInfo: undefined;
};

const OptionsStack = createStackNavigator<OptionsStackParamList>();

const OptionsNavigator = () => {
    return (
        <OptionsStack.Navigator initialRouteName="OptionsHome">
            <OptionsStack.Screen
                name="OptionsHome"
                component={Options}
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
        </OptionsStack.Navigator>
    );
};

export default OptionsNavigator;
