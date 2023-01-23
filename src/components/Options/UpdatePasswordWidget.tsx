import React, {useState} from 'react';
import {View, StyleSheet, TextInput} from 'react-native';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import {PALETTE} from '@/constants';
import {Auth} from 'aws-amplify';

type UpdatePasswordWidgetProps = {
    invertButton?: boolean;
};

const UpdatePasswordWidget: React.FC<UpdatePasswordWidgetProps> = ({
    invertButton = false,
}) => {
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
            <View style={styles.box}>
                <TextInput
                    placeholder="Current Password"
                    placeholderTextColor={PALETTE.neutral[3]}
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
                    style={[styles.passwordInput, styles.bottomBorder]}
                />
                <TextInput
                    placeholder="New Password"
                    placeholderTextColor={PALETTE.neutral[3]}
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
                    style={[styles.passwordInput, styles.bottomBorder]}
                />
                <TextInput
                    placeholder="Confirm New Password"
                    placeholderTextColor={PALETTE.neutral[3]}
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
                    style={styles.passwordInput}
                />
            </View>
            <View style={styles.buttonContainer}>
                <AnimatedButton
                    style={
                        !invertButton
                            ? styles.updatePasswordButton
                            : styles.invertedUpdatePasswordButton
                    }
                    textStyle={
                        !invertButton
                            ? styles.updatePasswordButtonText
                            : styles.invertedUpdatePasswordButtonText
                    }
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
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
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
    invertedUpdatePasswordButton: {
        padding: 7,
        borderColor: PALETTE.neutral[8],
        backgroundColor: 'transparent',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    invertedUpdatePasswordButtonText: {
        color: PALETTE.neutral[8],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
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
    passwordInput: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: PALETTE.neutral[2],
    },
    bottomBorder: {
        borderBottomWidth: 1,
    },
});

export default UpdatePasswordWidget;
