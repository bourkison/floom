import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {AuthStackParamList} from '@/nav/Navigator';

import AnimatedButton from '@/components/Utility/AnimatedButton';

const HomeAuth = ({
    navigation,
}: StackScreenProps<AuthStackParamList, 'HomeAuth'>) => {
    // const signup = async () => {
    //     console.log('Signing up with email', email, 'password', password);
    //     const response = await Auth.signUp({
    //         username: email,
    //         password: password,
    //         attributes: {
    //             email: email,
    //         },
    //     });

    //     console.log('Signed up!', response);
    // };

    const navigateToLogin = () => {
        console.log('LOGIN');
    };

    const navigateToSignUp = () => {
        navigation.push('SignUp');
    };

    const navigateToGuest = () => {
        navigation.push('GuestWelcome');
    };

    return (
        <View style={styles.container}>
            <AnimatedButton
                style={styles.loginButton}
                textStyle={styles.loginButtonText}
                onPress={navigateToLogin}>
                Login
            </AnimatedButton>
            <AnimatedButton
                style={styles.signUpButton}
                textStyle={styles.signUpButtonText}
                onPress={navigateToSignUp}>
                Create Account
            </AnimatedButton>
            <Pressable style={styles.guestButton} onPress={navigateToGuest}>
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButton: {
        padding: 15,
        backgroundColor: '#1a1f25',
        flex: 1,
        justifyContent: 'center',
        borderRadius: 25,
        width: '100%',
        flexGrow: 0,
        flexShrink: 0,
        marginBottom: 5,
    },
    loginButtonText: {
        color: '#f3fcfa',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    signUpButton: {
        padding: 15,
        borderColor: '#1a1f25',
        borderWidth: 2,
        flex: 1,
        justifyContent: 'center',
        borderRadius: 25,
        width: '100%',
        flexGrow: 0,
        flexShrink: 0,
        marginBottom: 10,
    },
    signUpButtonText: {
        color: '#1a1f25',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    guestButton: {
        flex: 1,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 12,
    },
    guestButtonText: {
        color: 'gray',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
});

export default HomeAuth;
