import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {BrandHeader, FiltersHomeHeader} from '@/nav/Headers';
import Brand from '@/screens/Filters/Brand';
import FiltersHome from '@/screens/Filters/FiltersHome';

export type FiltersStackParamList = {
    FiltersHome: undefined;
    Brand: undefined;
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
            <FiltersStack.Screen
                name="Brand"
                component={Brand}
                options={{header: BrandHeader}}
            />
        </FiltersStack.Navigator>
    );
};

export default FiltersNavigator;
