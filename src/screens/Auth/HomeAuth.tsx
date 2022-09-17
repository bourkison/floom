import React, {useState} from 'react';
import {View, Text, Button, TextInput, StyleSheet} from 'react-native';
import {Auth} from 'aws-amplify';
import {StatusBar} from 'expo-status-bar';
import AnimatedButton from '@/components/Utility/AnimatedButton';

const HomeAuth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signup = async () => {
        console.log('Signing up with email', email, 'password', password);
        const response = await Auth.signUp({
            username: email,
            password: password,
            attributes: {
                email: email,
            },
        });

        console.log('Signed up!', response);
    };

    const navigateToLogin = () => {
        console.log('LOGIN');
    };

    const navigateToSignUp = () => {
        console.log('SIGN UP');
    };

    const navigateToGuest = () => {
        console.log('GUEST');
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
            <AnimatedButton
                style={styles.guestButton}
                textStyle={styles.guestButtonText}
                onPress={navigateToGuest}
                scale={1}>
                Continue as Guest
            </AnimatedButton>
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
