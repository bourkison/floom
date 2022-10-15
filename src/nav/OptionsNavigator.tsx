import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Options from '@/screens/Options/Options';
import {OptionsHeader} from '@/nav/Headers';

export type OptionsStackParamList = {
    OptionsHome: undefined;
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
        </OptionsStack.Navigator>
    );
};

export default OptionsNavigator;
