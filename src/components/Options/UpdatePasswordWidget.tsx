import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import TextInput from '@/components/Utility/TextInput';
import {PALETTE} from '@/constants';
import {Auth} from 'aws-amplify';

const UpdatePasswordWidget = () => {
    const [secureTextP, setSecureTextP] = useState(false);
    const [secureTextNP, setSecureTextNP] = useState(false);
    const [secureTextCNP, setSecureTextCNP] = useState(false);

    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confNewPassword, setConfNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const updatePassword = async () => {
        setIsUpdatingPassword(true);

        try {
            if (newPassword !== confNewPassword) {
                throw new Error("Passwords don't match!");
            }
            const user = await Auth.currentAuthenticatedUser();
            await Auth.changePassword(user, password, newPassword);
        } catch (err) {
            // TODO: Handle error.
            console.error(err);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <View>
            <TextInput
                placeholder="Current Password"
                placeholderTextColor="#343E4B"
                onChangeText={setPassword}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={secureTextP}
                editable={!isUpdatingPassword}
                onFocus={() => {
                    // Hacky way due to the below issue:
                    // https://github.com/facebook/react-native/issues/21911
                    setSecureTextP(true);
                }}
                style={styles.passwordInput}
            />
            <TextInput
                placeholder="New Password"
                placeholderTextColor="#343E4B"
                onChangeText={setNewPassword}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={secureTextNP}
                editable={!isUpdatingPassword}
                onFocus={() => {
                    // Hacky way due to the below issue:
                    // https://github.com/facebook/react-native/issues/21911
                    setSecureTextNP(true);
                }}
                style={styles.passwordInput}
            />
            <TextInput
                placeholder="Confirm New Password"
                placeholderTextColor="#343E4B"
                onChangeText={setConfNewPassword}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={secureTextCNP}
                editable={!isUpdatingPassword}
                onFocus={() => {
                    // Hacky way due to the below issue:
                    // https://github.com/facebook/react-native/issues/21911
                    setSecureTextCNP(true);
                }}
            />
            <View style={styles.buttonContainer}>
                <AnimatedButton
                    style={styles.updatePasswordButton}
                    textStyle={styles.updatePasswordButtonText}
                    onPress={updatePassword}
                    disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? (
                        <Spinner
                            diameter={14}
                            spinnerWidth={2}
                            backgroundColor="#1a1f25"
                            spinnerColor="#f3fcfa"
                        />
                    ) : (
                        'Update Password'
                    )}
                </AnimatedButton>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        padding: 10,
    },
    updatePasswordButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        flexGrow: 0,
        flexShrink: 0,
        alignSelf: 'center',
    },
    updatePasswordButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    passwordInput: {
        marginBottom: 10,
    },
});

export default UpdatePasswordWidget;
