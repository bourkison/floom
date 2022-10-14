import React, {useState} from 'react';
import {Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {AuthStackParamList} from '@/nav/Navigator';
import {StackScreenProps} from '@react-navigation/stack';
import {TextInput} from 'react-native-gesture-handler';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import {useAppDispatch} from '@/store/hooks';
import {Auth} from 'aws-amplify';
import {FETCH_USER} from '@/store/slices/user';

const Login = ({navigation}: StackScreenProps<AuthStackParamList, 'Login'>) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useAppDispatch();

    const login = async () => {
        try {
            setIsLoading(true);
            console.log('Logging in');
            await Auth.signIn({
                username: email,
                password: password,
            }).catch(err => {
                if (err.code === 'UserNotConfirmedException') {
                    navigation.replace('VerifyEmail', {
                        username: email,
                        password: password,
                        sendCodeOnLoad: true,
                    });
                } else if (err.code === 'NotAuthorizedException') {
                    // TODO: Handle incorrect username/password error
                    throw err;
                }
            });

            console.log('Logged in. Fetching user.');

            await dispatch(FETCH_USER());

            console.log('User fetched.');
        } catch (err) {
            // TODO: Handle error.
            console.error(err);
            setIsLoading(false);
        }
    };

    const signUp = () => {
        navigation.replace('SignUp');
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <View>
                    <TextInput
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor="#343E4B"
                        autoComplete="email"
                        autoCorrect={false}
                        autoCapitalize="none"
                        style={styles.textInput}
                        selectionColor="#000"
                        keyboardType="email-address"
                        returnKeyType="next"
                    />
                </View>
                <View>
                    <TextInput
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="#343E4B"
                        autoComplete="password"
                        autoCorrect={false}
                        autoCapitalize="none"
                        style={styles.textInput}
                        selectionColor="#000"
                        returnKeyType="done"
                        secureTextEntry={true}
                        onSubmitEditing={login}
                    />
                </View>
                <View>
                    <AnimatedButton
                        style={styles.loginButton}
                        textStyle={styles.loginButtonText}
                        onPress={login}
                        disabled={isLoading}>
                        {isLoading ? (
                            <Spinner
                                diameter={14}
                                spinnerWidth={2}
                                backgroundColor="#1a1f25"
                                spinnerColor="#f3fcfa"
                            />
                        ) : (
                            'Login'
                        )}
                    </AnimatedButton>
                </View>
                <View>
                    <Pressable style={styles.signUpButton} onPress={signUp}>
                        <Text style={styles.signUpButtonText}>
                            Sign Up instead
                        </Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    textInput: {
        color: '#1a1f25',
        borderColor: '#1a1f25',
        backgroundColor: '#f3fcfa',
        borderRadius: 5,
        borderWidth: 2,
        fontSize: 14,
        flexShrink: 0,
        flexGrow: 0,
        padding: 10,
        marginBottom: 10,
    },
    loginButton: {
        padding: 10,
        backgroundColor: '#1a1f25',
        justifyContent: 'center',
        borderRadius: 25,
        width: '50%',
        flexGrow: 0,
        flexShrink: 0,
        alignSelf: 'center',
        alignItems: 'center',
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
        flex: 1,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 12,
        marginTop: 10,
    },
    signUpButtonText: {
        color: 'gray',
        fontSize: 12,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
});

export default Login;
