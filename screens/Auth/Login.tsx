import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';

import LoginForm from '@/components/User/LoginForm';
import {RootStackParamList} from '@/types/nav';

const Login = (_: StackScreenProps<RootStackParamList, 'Login'>) => {
    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.formCont}>
                <LoginForm />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
    },
    formCont: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Login;
