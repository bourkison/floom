import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {CollectionViewHeader, SavedProductsHeader} from '@/nav/Headers';
import CollectionNew from '@/screens/Saved/CollectionNew';
import CollectionView from '@/screens/Saved/CollectionView';
import SavedHome from '@/screens/Saved/SavedHome';
import {Database} from '@/types/schema';

export type SavedStackParamList = {
    SavedHome: undefined;
    CollectionView: {
        products: Database['public']['Views']['v_saves']['Row'][];
        name: string;
    };
    CollectionNew: undefined;
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
            <SavedStack.Screen
                name="CollectionNew"
                component={CollectionNew}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    gestureDirection: 'vertical',
                }}
            />
        </SavedStack.Navigator>
    );
};

export default SavedNavigator;
