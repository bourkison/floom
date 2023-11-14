import {StackScreenProps} from '@react-navigation/stack';
// import dayjs from 'dayjs';
import React, {useState} from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TextInput,
    ActivityIndicator,
    Image,
} from 'react-native';

import UpdateDetailsWidget from '@/components/User/UpdateDetailsWidget';
import UpdatePasswordWidget from '@/components/User/UpdatePasswordWidget';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import SectionHeader from '@/components/Utility/SectionHeader';
import {PALETTE} from '@/constants';
import {AuthStackParamList} from '@/nav/Navigator';
import {Database} from '@/types/schema';

type UserRow = Database['public']['Tables']['users']['Row'];

const SignUp = ({
    navigation,
}: StackScreenProps<AuthStackParamList, 'SignUp'>) => {
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');

    const [name, setName] = useState('');
    const [dob, setDob] = useState(new Date());
    const [gender, setGender] = useState<UserRow['gender'] | ''>('');

    const [password, setPassword] = useState('');
    const [confPassword, setConfPassword] = useState('');

    const validateForm = (): boolean => {
        if (password !== confPassword) {
            return false;
        }

        return true;
    };

    const signUp = async () => {
        validateForm();
        setIsLoading(true);
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/signUpBackground.png')}
                style={{
                    width: 500 / (9 / 16),
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    position: 'absolute',
                }}
            />
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
                        dob={dob}
                        setDob={setDob}
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
                        {isLoading ? <ActivityIndicator /> : 'Sign Up'}
                    </AnimatedButton>
                </View>
            </ScrollView>
        </View>
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
