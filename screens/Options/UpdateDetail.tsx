import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, ScrollView} from 'react-native';

import DeleteAccountWidget from '@/components/Options/DeleteAccountWidget';
import UpdatePasswordWidget from '@/components/Options/UpdatePasswordWidget';
import SectionHeader from '@/components/Utility/SectionHeader';
import {PALETTE} from '@/constants';
import {OptionsStackParamList} from '@/nav/types';
import {useAppSelector} from '@/store/hooks';

const UpdateDetail: React.FC<
    StackScreenProps<OptionsStackParamList, 'UpdateDetail'>
> = () => {
    const user = useAppSelector(state => state.user.userData);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    return (
        <ScrollView keyboardShouldPersistTaps="never">
            <View style={styles.section}>
                <View style={styles.box}>
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor={PALETTE.neutral[3]}
                        autoCapitalize="sentences"
                        autoComplete="name"
                        autoCorrect={false}
                        value={user?.email || ''}
                        style={styles.textInput}
                        editable={false}
                    />
                </View>
                <Text style={styles.hintText}>Email can not be changed.</Text>
            </View>
            <View style={styles.section}>
                <SectionHeader>Update Details</SectionHeader>
                <View>
                    <Text>TODO: Update here.</Text>
                </View>
            </View>

            <View style={[styles.section, styles.topMargin]}>
                <SectionHeader>Update Password</SectionHeader>
                <UpdatePasswordWidget
                    invertButton={true}
                    isUpdate={true}
                    currentPassword={currentPassword}
                    setCurrentPassword={setCurrentPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmNewPassword={confirmNewPassword}
                    setConfirmNewPassword={setConfirmNewPassword}
                />
            </View>

            <View style={[styles.section, styles.topMargin]}>
                <SectionHeader>Delete Account</SectionHeader>
                <DeleteAccountWidget />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
});

export default UpdateDetail;
