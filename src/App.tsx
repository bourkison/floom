import React, {useEffect} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import Navigator from '@/nav/Navigator';

import {Provider} from 'react-redux';
import store from '@/store';

import {Amplify} from 'aws-amplify';
import awsconfig from './aws-exports';
import {FETCH_USER} from './store/slices/user';
Amplify.configure(awsconfig);

const App = () => {
    useEffect(() => {
        const fetchUser = async () => {
            store.dispatch(FETCH_USER());
        };

        fetchUser();
    }, []);

    return (
        <Provider store={store}>
            <NavigationContainer>
                <Navigator />
            </NavigationContainer>
        </Provider>
    );
};

export default App;
