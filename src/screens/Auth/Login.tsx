import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {AuthStackParamList} from '@/nav/Navigator';
import {StackScreenProps} from '@react-navigation/stack';
import LoginForm from '@/components/User/LoginForm';

const Login = ({}: StackScreenProps<AuthStackParamList, 'Login'>) => {
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
