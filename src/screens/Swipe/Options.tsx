import React from 'react';
import {SafeAreaView, Text} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

const Options = ({}: StackScreenProps<MainStackParamList, 'Options'>) => {
    return (
        <SafeAreaView>
            <Text>Options</Text>
        </SafeAreaView>
    );
};

export default Options;
