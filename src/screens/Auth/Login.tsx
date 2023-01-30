import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {AuthStackParamList} from '@/nav/Navigator';
import {StackScreenProps} from '@react-navigation/stack';
import LoginForm from '@/components/User/LoginForm';

const Login = ({}: StackScreenProps<AuthStackParamList, 'Login'>) => {
    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={{flex: 5}} />
            <View
                style={{
                    flex: 2,
                }}>
                <LoginForm />
            </View>
            <View style={{flex: 5}} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
    },
});

export default Login;
