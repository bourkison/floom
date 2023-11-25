import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {BrandHeader, ColorHeader, FiltersHomeHeader} from '@/nav/Headers';
import Brand from '@/screens/Filters/Brand';
import Category from '@/screens/Filters/Category';
import Color from '@/screens/Filters/Color';
import FiltersHome from '@/screens/Filters/FiltersHome';

export type FiltersStackParamList = {
    FiltersHome: undefined;
    Brand: undefined;
    Color: undefined;
    Category: undefined;
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
            <FiltersStack.Screen
                name="Color"
                component={Color}
                options={{header: ColorHeader}}
            />
            <FiltersStack.Screen
                name="Category"
                component={Category}
                options={{header: ColorHeader}}
            />
        </FiltersStack.Navigator>
    );
};

export default FiltersNavigator;
