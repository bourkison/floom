import React, {useState} from 'react';
import {Text, ScrollView, StyleSheet, View} from 'react-native';
import TextInput from '@/components/Utility/TextInput';
import Spinner from '@/components/Utility/Spinner';
import SectionHeader from '@/components/Utility/SectionHeader';
import {useAppSelector} from '@/store/hooks';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {PALETTE} from '@/constants';
import DeletedProductsWidget from '@/components/Options/DeletedProductsWidget';

const Options = () => {
    const user = useAppSelector(state => state.user.docData);
    const [name, setName] = useState(user?.name || '');

    const [secureTextP, setSecureTextP] = useState(false);
    const [secureTextNP, setSecureTextNP] = useState(false);
    const [secureTextCNP, setSecureTextCNP] = useState(false);

    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confNewPassword, setConfNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const updatePassword = async () => {
        setIsUpdatingPassword(!isUpdatingPassword);
        console.log('Update', password, newPassword, confNewPassword);
    };

    if (!user) {
        return (
            <View>
                <Text>No logged in user.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <SectionHeader>Deleted Products</SectionHeader>
                <DeletedProductsWidget />
            </View>
            <View style={styles.section}>
                <SectionHeader>Email</SectionHeader>
                <Text style={{textAlign: 'center'}}>{user.email}</Text>
            </View>
            <View style={styles.section}>
                <SectionHeader>Account Info</SectionHeader>
                <TextInput
                    placeholder="Name"
                    placeholderTextColor="#343E4B"
                    onChangeText={setName}
                    autoCapitalize="sentences"
                    autoComplete="name"
                    autoCorrect={false}
                    value={name}
                />
            </View>

            <View style={styles.section}>
                <SectionHeader>Password</SectionHeader>
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
    },
    section: {
        marginBottom: 15,
    },
    header: {
        fontSize: 14,
        marginVertical: 5,
        fontWeight: 'bold',
    },
    buttonContainer: {
        padding: 10,
    },
    updatePasswordButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
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

export default Options;
