import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {FiltersHomeHeader} from '@/nav/Headers';
import FiltersHome from '@/screens/Filters/FiltersHome';

export type FiltersStackParamList = {
    FiltersHome: undefined;
};

const FiltersStack = createStackNavigator<FiltersStackParamList>();

const FiltersNavigator = () => {
    return (
        <FiltersStack.Navigator initialRouteName="FiltersHome">
            <FiltersStack.Screen
                name="FiltersHome"
                component={FiltersHome}
                options={{header: FiltersHomeHeader}}
            />
        </FiltersStack.Navigator>
    );
};

export default FiltersNavigator;
