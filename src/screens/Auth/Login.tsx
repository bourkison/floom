import React from 'react';
import {SafeAreaView, Text} from 'react-native';
import {AuthStackParamList} from '@/nav/Navigator';
import {StackScreenProps} from '@react-navigation/stack';

const Login = ({}: StackScreenProps<AuthStackParamList, 'Login'>) => {
    return (
        <SafeAreaView>
            <Text>Login</Text>
        </SafeAreaView>
    );
};

export default Login;
