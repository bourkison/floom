import React, {useEffect, useState} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Pressable,
} from 'react-native';

import {AuthStackParamList} from '@/nav/Navigator';
import {StackScreenProps} from '@react-navigation/stack';

import {Auth} from 'aws-amplify';

import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import {useAppDispatch} from '@/store/hooks';
import {FETCH_USER} from '@/store/slices/user';

const RESEND_TIMER = 30;

const VerifyEmail = ({
    route,
}: StackScreenProps<AuthStackParamList, 'VerifyEmail'>) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(RESEND_TIMER);
    const [countdownInterval, setCountdownInterval] = useState<
        NodeJS.Timer | undefined
    >();

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!countdownInterval && !resendTimer) {
            startTimer();
        }

        return () => {
            clearInterval(countdownInterval);
        };
    }, [countdownInterval, resendTimer]);

    const startTimer = () => {
        setCountdownInterval(
            setInterval(() => {
                console.log('INTERVAL');
                // Must run this logic within the setResendTimer() function as
                // intervals only remember the original
                setResendTimer(n => {
                    if (n <= 0) {
                        setCountdownInterval(interval => {
                            clearInterval(interval);
                            return undefined;
                        });
                        return 0;
                    }

                    return n - 1;
                });
            }, 1000),
        );
    };

    const verify = async () => {
        try {
            setIsLoading(true);
            await Auth.confirmSignUp(route.params.username, verificationCode);
            await Auth.signIn(route.params.username, route.params.password);
            await dispatch(FETCH_USER());
        } catch (err) {
            // TODO: Handle potential errors.
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const resendCode = async () => {
        try {
            setIsResending(true);
            await Auth.resendSignUp(route.params.username);
            setResendTimer(RESEND_TIMER);
            startTimer();
        } catch (err) {
            // TODO: Handle error.
            console.error(err);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <Text style={styles.headerText}>Verify Email</Text>
                <Text>
                    We have sent a verification code to your email. Please enter
                    the code in the box below.
                </Text>
                <TextInput
                    onChangeText={setVerificationCode}
                    placeholder="Verification Code"
                    placeholderTextColor="#343E4B"
                    autoComplete="off"
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.textInput}
                    selectionColor="#000"
                    returnKeyType="done"
                    onSubmitEditing={verify}
                />
                <AnimatedButton
                    style={styles.verifyButton}
                    textStyle={styles.verifyButtonText}
                    onPress={verify}
                    disabled={isLoading}>
                    {isLoading ? (
                        <Spinner
                            diameter={14}
                            spinnerWidth={2}
                            backgroundColor="#1a1f25"
                            spinnerColor="#f3fcfa"
                        />
                    ) : (
                        'Verify'
                    )}
                </AnimatedButton>
                <Pressable
                    style={styles.resendButton}
                    onPress={resendCode}
                    disabled={isResending || resendTimer > 0}>
                    <Text style={styles.resendButtonText}>
                        {isResending
                            ? 'Resending...'
                            : resendTimer > 0
                            ? 'You can resend in ' + resendTimer + ' seconds'
                            : 'Resend'}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
    },
    container: {
        padding: 10,
    },
    headerText: {
        color: '#1a1f25',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textInput: {
        marginTop: 25,
        color: '#1a1f25',
        borderColor: '#1a1f25',
        backgroundColor: '#f3fcfa',
        borderRadius: 5,
        borderWidth: 2,
        fontSize: 14,
        flexShrink: 0,
        flexGrow: 0,
        padding: 10,
    },
    verifyButton: {
        padding: 15,
        backgroundColor: '#1a1f25',
        flex: 1,
        justifyContent: 'center',
        borderRadius: 25,
        width: '50%',
        flexGrow: 0,
        flexShrink: 0,
        marginTop: 25,
        alignSelf: 'center',
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#f3fcfa',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    resendButton: {
        flex: 1,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 12,
        marginTop: 10,
    },
    resendButtonText: {
        color: 'gray',
        fontSize: 12,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
});

export default VerifyEmail;
