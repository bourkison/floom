import React, {useState} from 'react';

import {StackScreenProps} from '@react-navigation/stack';
import {AuthStackParamList} from '@/nav/Navigator';
import {
    SafeAreaView,
    StyleSheet,
    TextInput,
    View,
    ScrollView,
} from 'react-native';
import {Auth} from 'aws-amplify';

import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import dayjs from 'dayjs';

const SignUp = ({
    navigation,
}: StackScreenProps<AuthStackParamList, 'SignUp'>) => {
    const [secureText, setSecureText] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confPassword, setConfPassword] = useState('');
    const [dob, setDob] = useState(new Date());
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');

    const [name, setName] = useState('');

    const validateForm = (): boolean => {
        if (password !== confPassword) {
            return false;
        }

        return true;
    };

    const signUp = async () => {
        if (validateForm()) {
            setIsLoading(true);

            let payload = {
                username: email,
                password: password,
                attributes: {
                    email: email,
                    name: name,
                    birthdate: dayjs(dob).format('YYYY-MM-DD'),
                    gender: gender,
                    locale: 'United Kingdom',
                },
            };

            console.log('Signing up with:', payload);

            const user = await Auth.signUp(payload).catch(err => {
                // TODO: Handle sign up error.
                console.error(err);
            });

            if (user) {
                navigation.replace('VerifyEmail', {
                    username: email,
                    password: password,
                });
            }

            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.container}>
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
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#343E4B"
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect={false}
                        style={styles.textInput}
                        secureTextEntry={secureText}
                        onFocus={() => {
                            // Hacky way due to the below issue:
                            // https://github.com/facebook/react-native/issues/21911
                            setSecureText(true);
                        }}
                    />
                    <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor="#343E4B"
                        onChangeText={setConfPassword}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect={false}
                        secureTextEntry={true}
                        style={styles.textInput}
                    />
                    <TextInput
                        placeholder="Name"
                        placeholderTextColor="#343E4B"
                        onChangeText={setName}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect={false}
                        style={styles.textInput}
                    />
                    <View style={styles.dobInput}>
                        <DateTimePicker
                            value={dob}
                            display="spinner"
                            onChange={(e, d) => {
                                setDob(d || new Date());
                            }}
                        />
                    </View>

                    <View style={styles.genderInput}>
                        <Picker
                            selectedValue={gender}
                            onValueChange={setGender}>
                            <Picker.Item value="male" label="Male" />
                            <Picker.Item value="female" label="Female" />
                            <Picker.Item value="other" label="Other" />
                        </Picker>
                    </View>

                    <View>
                        <AnimatedButton
                            style={styles.signUpButton}
                            textStyle={styles.signUpButtonText}
                            onPress={signUp}
                            disabled={isLoading}>
                            {isLoading ? (
                                <Spinner
                                    diameter={14}
                                    spinnerWidth={2}
                                    backgroundColor="#1a1f25"
                                    spinnerColor="#f3fcfa"
                                />
                            ) : (
                                'Sign Up'
                            )}
                        </AnimatedButton>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
    },
    container: {
        paddingHorizontal: 10,
    },
    textInput: {
        flex: 1,
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
    dobInput: {
        marginTop: 25,
        alignContent: 'center',
        borderColor: '#1a1f25',
        borderRadius: 5,
        borderWidth: 1,
    },
    genderInput: {
        borderColor: '#1a1f25',
        marginTop: 25,
        borderRadius: 5,
        borderWidth: 1,
    },
    signUpButton: {
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
    signUpButtonText: {
        color: '#f3fcfa',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
});

export default SignUp;
