import React, {useState} from 'react';

import {StackScreenProps} from '@react-navigation/stack';
import {AuthStackParamList} from '@/nav/Navigator';
import {SafeAreaView, StyleSheet, View, ScrollView, Text} from 'react-native';
import {Auth} from 'aws-amplify';

import TextInput from '@/components/Utility/TextInput';

import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import dayjs from 'dayjs';
import {PALETTE} from '@/constants';
import SectionHeader from '@/components/Utility/SectionHeader';
import UpdateDetailsWidget from '@/components/User/UpdateDetailsWidget';
import {UserDocData} from '@/types/user';
import UpdatePasswordWidget from '@/components/Options/UpdatePasswordWidget';

const SignUp = ({
    navigation,
}: StackScreenProps<AuthStackParamList, 'SignUp'>) => {
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');

    const [name, setName] = useState('');
    const [dob, setDob] = useState(new Date());
    const [gender, setGender] = useState<UserDocData['gender'] | ''>('');
    const [country, setCountry] = useState<UserDocData['country'] | ''>('');
    const [currency, setCurrency] = useState<UserDocData['currency'] | ''>('');

    const [password, setPassword] = useState('');
    const [confPassword, setConfPassword] = useState('');

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
                    locale: country,
                    'custom:currency': currency,
                },
            };

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
                <View style={styles.section}>
                    <View style={styles.box}>
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor={PALETTE.neutral[3]}
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect={false}
                            value={email}
                            style={styles.textInput}
                            onChangeText={setEmail}
                        />
                    </View>
                    <Text style={styles.hintText}>
                        Your email can not be changed later.
                    </Text>
                </View>
                <View style={styles.section}>
                    <SectionHeader>Details</SectionHeader>
                    <UpdateDetailsWidget
                        name={name}
                        setName={setName}
                        gender={gender}
                        setGender={setGender}
                        country={country}
                        setCountry={setCountry}
                        dob={dob}
                        setDob={setDob}
                        currency={currency}
                        setCurrency={setCurrency}
                        isUpdate={false}
                    />
                </View>
                <View style={[styles.section, styles.topMargin]}>
                    <SectionHeader>Password</SectionHeader>
                    <UpdatePasswordWidget
                        isUpdate={false}
                        newPassword={password}
                        setNewPassword={setPassword}
                        confirmNewPassword={confPassword}
                        setConfirmNewPassword={setConfPassword}
                    />
                </View>
                <View style={styles.buttonContainer}>
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
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textInput: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: PALETTE.neutral[2],
    },
    section: {marginTop: 10, width: '100%'},
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
    inputHeader: {
        textTransform: 'uppercase',
        color: PALETTE.rose[4],
        paddingHorizontal: 10,
        fontWeight: '600',
        borderColor: PALETTE.neutral[2],
    },
    borderTop: {
        borderTopWidth: 1,
    },
    topMargin: {
        marginTop: 20,
    },
    hintText: {
        color: PALETTE.gray[4],
        fontSize: 12,
        paddingHorizontal: 5,
        marginTop: 3,
    },
    signUpButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    signUpButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    buttonContainer: {paddingHorizontal: 10, marginTop: 10},
});

export default SignUp;
