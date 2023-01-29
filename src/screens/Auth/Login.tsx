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
import {PALETTE} from '@/constants';

const Login = ({navigation}: StackScreenProps<AuthStackParamList, 'Login'>) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useAppDispatch();

    const login = async () => {
        try {
            setIsLoading(true);
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

                console.error('ERROR:', err);
                throw err;
            });

            await dispatch(FETCH_USER());
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
                <View style={styles.box}>
                    <TextInput
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor={PALETTE.neutral[3]}
                        autoComplete="email"
                        autoCorrect={false}
                        autoCapitalize="none"
                        style={[styles.textInput, styles.bottomBorder]}
                        selectionColor="#000"
                        keyboardType="email-address"
                        returnKeyType="next"
                    />
                    <TextInput
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor={PALETTE.neutral[3]}
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
                <View style={styles.buttonContainer}>
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
        justifyContent: 'center',
    },
    box: {
        marginTop: 10,
        shadowColor: PALETTE.neutral[5],
        shadowOpacity: 0.3,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        backgroundColor: PALETTE.neutral[0],
    },
    textInput: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: PALETTE.neutral[2],
    },
    bottomBorder: {
        borderBottomWidth: 1,
    },
    buttonContainer: {
        padding: 10,
    },
    loginButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    loginButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
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
