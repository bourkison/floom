import {StackScreenProps, createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {useSharedSavedContext} from '@/context/saved';
import {CollectionViewHeader} from '@/nav/Headers';
import {RootStackParamList, SavedStackParamList} from '@/nav/types';
import CollectionNew from '@/screens/Saved/CollectionNew';
import CollectionView from '@/screens/Saved/CollectionView';
import SavedHome from '@/screens/Saved/SavedHome';

const SavedStack = createStackNavigator<SavedStackParamList>();

const SavedNavigator = ({
    navigation,
}: StackScreenProps<RootStackParamList, 'SavedProducts'>) => {
    const {sliceSaves} = useSharedSavedContext();

    navigation.addListener('beforeRemove', sliceSaves);

    return (
        <SavedStack.Navigator initialRouteName="SavedHome">
            <SavedStack.Screen
                name="SavedHome"
                component={SavedHome}
                options={{headerShown: false}}
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
