import React, {useEffect} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import Navigator from '@/nav/Navigator';

import {Provider} from 'react-redux';
import store from '@/store';

import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {Amplify} from 'aws-amplify';
import awsconfig from './aws-exports';
import {FETCH_USER} from './store/slices/user';
Amplify.configure(awsconfig);

const App = () => {
    useEffect(() => {
        const initFetch = async () => {
            store.dispatch(FETCH_USER());
        };

        initFetch();
    }, []);

    return (
        <Provider store={store}>
            <GestureHandlerRootView style={{flex: 1}}>
                <NavigationContainer>
                    <Navigator />
                </NavigationContainer>
            </GestureHandlerRootView>
        </Provider>
    );
};

export default App;
