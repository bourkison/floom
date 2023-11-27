import {StackScreenProps, createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {useSharedSavedContext} from '@/context/saved';
import {CollectionViewHeader, SavedProductsHeader} from '@/nav/Headers';
import {MainStackParamList} from '@/nav/Navigator';
import CollectionNew from '@/screens/Saved/CollectionNew';
import CollectionView from '@/screens/Saved/CollectionView';
import SavedHome from '@/screens/Saved/SavedHome';

export type SavedStackParamList = {
    SavedHome: undefined;
    CollectionView: {
        collectionId: number;
    };
    CollectionNew: undefined;
};

const SavedStack = createStackNavigator<SavedStackParamList>();

const SavedNavigator = ({
    navigation,
}: StackScreenProps<MainStackParamList, 'SavedProducts'>) => {
    const {sliceSaves} = useSharedSavedContext();

    navigation.addListener('beforeRemove', sliceSaves);

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
