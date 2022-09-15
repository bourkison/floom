import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View, TextInput, Button} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {useState} from 'react';

import {Amplify, Auth} from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

export default function App() {
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
        <NavigationContainer>
            <View style={styles.container}>
                <Text>Open up App.tsx to start working on your app!</Text>
                <View>
                    <TextInput onChangeText={setEmail} placeholder="Email" />
                    <TextInput
                        onChangeText={setPassword}
                        placeholder="Password"
                    />
                    <Button onPress={signup} title="Sign Up" />
                </View>
                <StatusBar style="auto" />
            </View>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
