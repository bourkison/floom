import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import SectionHeader from '@/components/Utility/SectionHeader';
import UpdatePasswordWidget from '@/components/Options/UpdatePasswordWidget';
import DeletedProductsWidget from '@/components/Options/DeletedProductsWidget';
import AccountDetailsWidget from '@/components/Options/AccountDetailsWidget';
import LogoutWidget from '@/components/Options/LogoutWidget';
import {useAppSelector} from '@/store/hooks';

const Options = () => {
    const isGuest = useAppSelector(state => state.user.isGuest);

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
                        <UpdatePasswordWidget />
                    </View>
                </View>
            ) : (
                <View style={styles.section}>
                    <SectionHeader>Account</SectionHeader>
                </View>
            )}

            <View style={styles.section}>
                <SectionHeader>App Info</SectionHeader>
            </View>

            {!isGuest ? (
                <View style={styles.section}>
                    <SectionHeader>Other</SectionHeader>

                    <LogoutWidget />
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
});

export default Options;
