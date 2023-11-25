import React, {useState} from 'react';
import {View, StyleSheet, TextInput, ActivityIndicator} from 'react-native';

import AnimatedButton from '@/components/Utility/AnimatedButton';
import Feedback from '@/components/Utility/Feedback';
import {PALETTE} from '@/constants';
import {supabase} from '@/services/supabase';

type UpdatePasswordWidgetProps = {
    invertButton?: boolean;
    isUpdate: boolean;
    currentPassword?: string;
    setCurrentPassword?: (password: string) => void;
    newPassword: string;
    setNewPassword: (password: string) => void;
    confirmNewPassword: string;
    setConfirmNewPassword: (confirmPassword: string) => void;
};

const UpdatePasswordWidget: React.FC<UpdatePasswordWidgetProps> = ({
    invertButton = false,
    isUpdate,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
}) => {
    const [secureTextP, setSecureTextP] = useState(false);
    const [secureTextNP, setSecureTextNP] = useState(false);
    const [secureTextCNP, setSecureTextCNP] = useState(false);

    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState<
        'success' | 'warning' | 'error'
    >('success');

    const updatePassword = async () => {
        if (isUpdate && currentPassword) {
            setIsUpdatingPassword(true);

            try {
                if (newPassword !== confirmNewPassword) {
                    throw new Error("Passwords don't match.");
                }
                const {error: userError} = await supabase.auth.getUser();

                if (userError) {
                    throw new Error(userError.message);
                }

                const {error} = await supabase.auth.updateUser({
                    password: newPassword,
                });

                if (error) {
                    throw new Error(error.message);
                }

                setFeedbackType('success');
                setFeedbackMessage('Password changed successfully');
                setFeedbackVisible(true);

                if (setCurrentPassword) {
                    setCurrentPassword('');
                }

                setNewPassword('');
                setConfirmNewPassword('');
            } catch (err: any) {
                // TODO: Handle error.
                setFeedbackType('error');
                setFeedbackMessage(err?.message || 'Error updating');
                setFeedbackVisible(true);
            } finally {
                setIsUpdatingPassword(false);
            }
        }
    };

    const feedbackDone = () => {
        setFeedbackVisible(false);
        setFeedbackMessage('');
        setFeedbackType('success');
    };

    return (
        <View>
            <View style={styles.box}>
                {isUpdate ? (
                    <TextInput
                        placeholder="Current Password"
                        placeholderTextColor={PALETTE.neutral[3]}
                        onChangeText={setCurrentPassword}
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
                ) : undefined}
                <TextInput
                    placeholder={isUpdate ? 'New Password' : 'Password'}
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
                    placeholder={
                        isUpdate ? 'Confirm New Password' : 'Confirm Password'
                    }
                    placeholderTextColor={PALETTE.neutral[3]}
                    onChangeText={setConfirmNewPassword}
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
            {isUpdate ? (
                <View>
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
                                <ActivityIndicator />
                            ) : (
                                'Update Password'
                            )}
                        </AnimatedButton>
                    </View>
                    <Feedback
                        type={feedbackType}
                        message={feedbackMessage}
                        displayTime={5000}
                        visible={feedbackVisible}
                        onFinish={feedbackDone}
                        containerStyle={styles.feedbackStyle}
                    />
                </View>
            ) : undefined}
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
    feedbackStyle: {padding: 10},
});

export default UpdatePasswordWidget;
