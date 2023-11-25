import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import AccountDetailsWidget from '@/components/Options/AccountDetailsWidget';
import AppInfoWidget from '@/components/Options/AppInfoWidget';
import DeletedProductsWidget from '@/components/Options/DeletedProductsWidget';
import GuestAccountWidget from '@/components/Options/GuestAccountWidget';
import LogoutWidget from '@/components/Options/LogoutWidget';
import UpdatePasswordWidget from '@/components/Options/UpdatePasswordWidget';
import SectionHeader from '@/components/Utility/SectionHeader';
import {useAppSelector} from '@/store/hooks';

const OptionsHome = () => {
    const isGuest = useAppSelector(state => state.user.isGuest);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confNewPassword, setConfNewPassword] = useState('');

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <SectionHeader>Deleted Products</SectionHeader>
                <DeletedProductsWidget />
            </View>
            {!isGuest ? (
                <View>
                    <View style={styles.section}>
                        <SectionHeader>Account Details</SectionHeader>
                        <AccountDetailsWidget />
                    </View>
                    <View style={styles.section}>
                        <SectionHeader>Password</SectionHeader>
                        <UpdatePasswordWidget
                            isUpdate={true}
                            currentPassword={currentPassword}
                            setCurrentPassword={setCurrentPassword}
                            newPassword={newPassword}
                            setNewPassword={setNewPassword}
                            confirmNewPassword={confNewPassword}
                            setConfirmNewPassword={setConfNewPassword}
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.section}>
                    <SectionHeader>Account</SectionHeader>
                    <GuestAccountWidget />
                </View>
            )}

            <View style={styles.section}>
                <SectionHeader>App Info</SectionHeader>
                <AppInfoWidget />
            </View>

            {!isGuest ? (
                <View style={styles.section}>
                    <SectionHeader>Other</SectionHeader>

                    <View style={styles.logoutContainer}>
                        <LogoutWidget />
                    </View>
                </View>
            ) : undefined}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        marginBottom: 15,
    },
    header: {
        fontSize: 14,
        marginVertical: 5,
        fontWeight: 'bold',
    },
    logoutContainer: {
        marginTop: 10,
    },
});

export default OptionsHome;
