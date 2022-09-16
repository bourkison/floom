import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import Navigator from '@/nav/Navigator';

import {Amplify} from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

const App = () => {
    return (
        <NavigationContainer>
            <Navigator />
        </NavigationContainer>
    );
};

export default App;
