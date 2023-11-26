import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {CollectionViewHeader, SavedProductsHeader} from '@/nav/Headers';
import CollectionView from '@/screens/Saved/CollectionView';
import SavedHome from '@/screens/Saved/SavedHome';
import {Database} from '@/types/schema';

export type SavedStackParamList = {
    SavedHome: undefined;
    CollectionView: {
        products: Database['public']['Views']['v_saves']['Row'][];
        name: string;
    };
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
            <SavedStack.Screen
                name="CollectionView"
                component={CollectionView}
                options={{header: CollectionViewHeader}}
            />
        </SavedStack.Navigator>
    );
};

export default SavedNavigator;
