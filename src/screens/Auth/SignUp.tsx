import React, {useState} from 'react';
import {View, Text, Button, TextInput, StyleSheet} from 'react-native';
import {Auth} from 'aws-amplify';
import {StatusBar} from 'expo-status-bar';

const SignUp = () => {
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

    return (
        <View style={styles.container}>
            <Text>Open up App.tsx to start working on your app!</Text>
            <View>
                <TextInput onChangeText={setEmail} placeholder="Email" />
                <TextInput onChangeText={setPassword} placeholder="Password" />
                <Button onPress={signup} title="Sign Up" />
            </View>
            <StatusBar style="auto" />
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
});

export default SignUp;
