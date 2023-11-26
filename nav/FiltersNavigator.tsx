import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {
    BrandHeader,
    CategoryHeader,
    ColorHeader,
    FiltersHomeHeader,
    GenderHeader,
    PriceHeader,
} from '@/nav/Headers';
import Brand from '@/screens/Filters/Brand';
import Category from '@/screens/Filters/Category';
import Color from '@/screens/Filters/Color';
import FiltersHome from '@/screens/Filters/FiltersHome';
import Gender from '@/screens/Filters/Gender';
import Price from '@/screens/Filters/Price';

export type FiltersStackParamList = {
    FiltersHome: undefined;
    Brand: undefined;
    Color: undefined;
    Category: undefined;
    Gender: undefined;
    Price: undefined;
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
                options={{header: CategoryHeader}}
            />
            <FiltersStack.Screen
                name="Gender"
                component={Gender}
                options={{header: GenderHeader}}
            />
            <FiltersStack.Screen
                name="Price"
                component={Price}
                options={{header: PriceHeader}}
            />
        </FiltersStack.Navigator>
    );
};

export default FiltersNavigator;
