import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Options from '@/screens/Options/Options';
import {DeletedProductsHeader, OptionsHeader} from '@/nav/Headers';
import DeletedProducts from '@/screens/Options/DeletedProducts';

export type OptionsStackParamList = {
    OptionsHome: undefined;
    DeletedProducts: undefined;
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
        </OptionsStack.Navigator>
    );
};

export default OptionsNavigator;
