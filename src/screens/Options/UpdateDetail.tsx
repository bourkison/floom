import React, {useState} from 'react';
import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {useAppSelector} from '@/store/hooks';
import {StackScreenProps} from '@react-navigation/stack';
import {View, Text, TextInput, StyleSheet, ScrollView} from 'react-native';
import {PALETTE} from '@/constants';

import SectionHeader from '@/components/Utility/SectionHeader';
import UpdateDetailsWidget from '@/components/User/UpdateDetailsWidget';
import UpdatePasswordWidget from '@/components/Options/UpdatePasswordWidget';
import {UserDocData} from '@/types/user';
import DeleteAccountWidget from '@/components/Options/DeleteAccountWidget';

const UpdateDetail: React.FC<
    StackScreenProps<OptionsStackParamList, 'UpdateDetail'>
> = () => {
    const user = useAppSelector(state => state.user.docData);

    const [name, setName] = useState(user?.name || '');
    const [gender, setGender] = useState<UserDocData['gender'] | ''>(
        user?.gender || '',
    );
    const [country, setCountry] = useState<UserDocData['country'] | ''>(
        user?.country || '',
    );
    const [currency, setCurrency] = useState<UserDocData['currency'] | ''>(
        user?.currency || '',
    );
    const [dob, setDob] = useState(user?.dob ? new Date(user.dob) : new Date());

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
                <UpdateDetailsWidget
                    name={name}
                    setName={setName}
                    gender={gender}
                    setGender={setGender}
                    country={country}
                    setCountry={setCountry}
                    currency={currency}
                    setCurrency={setCurrency}
                    dob={dob}
                    setDob={setDob}
                    isUpdate={true}
                />
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
