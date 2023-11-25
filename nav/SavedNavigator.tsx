import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {SavedProductsHeader} from '@/nav/Headers';
import SavedHome from '@/screens/Saved/SavedHome';

export type SavedStackParamList = {
    SavedHome: undefined;
};

const SavedStack = createStackNavigator<SavedStackParamList>();

const SavedNavigator = () => {
    return (
        <SavedStack.Navigator initialRouteName="SavedHome">
            <SavedStack.Screen
                name="SavedHome"
                component={SavedHome}
                options={{header: SavedProductsHeader}}
            />
        </SavedStack.Navigator>
    );
};

export default SavedNavigator;
