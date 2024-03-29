import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

import AnimatedButton from '@/components/Utility/AnimatedButton';
import {PALETTE} from '@/constants';
import {RootStackParamList} from '@/types/nav';
import {supabase} from '@/services/supabase';
import {useAppDispatch} from '@/store/hooks';
import {login} from '@/store/slices/user';

const Login = () => {
    const dispatch = useAppDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const supabaseLogin = async () => {
        setIsLoading(true);

        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // TODO: Handle sign in error, reroute to verify page based on error.
            console.error(error);
            setIsLoading(false);
            return;
        }

        const {data: userData, error: dataError} = await supabase
            .from('users')
            .select()
            .eq('id', data.user.id)
            .limit(1)
            .single();

        if (dataError) {
            // TODO: Handle error, reroute to additionalInformation page based on error.
            console.error(dataError);
            setIsLoading(false);
            return;
        }

        dispatch(login(userData));
        setIsLoading(false);
    };

    const signUp = () => {
        navigation.push('SignUp', {startPageIndex: 0});
    };

    return (
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
                    secureTextEntry
                    onSubmitEditing={supabaseLogin}
                />
            </View>
            <View style={styles.buttonContainer}>
                <AnimatedButton
                    style={styles.loginButton}
                    textStyle={styles.loginButtonText}
                    onPress={supabaseLogin}
                    disabled={isLoading}
                    disabledColor="rgba(229, 231, 235, 0.15)">
                    {isLoading ? <ActivityIndicator /> : 'Login'}
                </AnimatedButton>
            </View>
            <View style={styles.signUpButtonCont}>
                <Pressable onPress={signUp} style={styles.signUpButton}>
                    <Text style={styles.signUpButtonText}>Sign Up instead</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
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
    bottomBorder: {
        borderBottomWidth: 1,
    },
    feedbackContainer: {padding: 10},
    signUpButtonCont: {alignItems: 'center'},
    signUpButton: {},
    signUpButtonText: {
        color: 'gray',
        fontSize: 12,
        textDecorationLine: 'underline',
        padding: 4,
    },
});

export default Login;
