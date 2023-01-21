import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import SectionHeader from '@/components/Utility/SectionHeader';
import UpdatePasswordWidget from '@/components/Options/UpdatePasswordWidget';
import DeletedProductsWidget from '@/components/Options/DeletedProductsWidget';
import AccountDetailsWidget from '@/components/Options/AccountDetailsWidget';
import LogoutWidget from '@/components/Options/LogoutWidget';

const Options = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <SectionHeader>Deleted Products</SectionHeader>
                <DeletedProductsWidget />
            </View>
            <View style={styles.section}>
                <SectionHeader>Account Details</SectionHeader>
                <AccountDetailsWidget />
            </View>
            <View style={styles.section}>
                <SectionHeader>Password</SectionHeader>
                <UpdatePasswordWidget />
            </View>
            <View style={styles.section}>
                <SectionHeader>App Info</SectionHeader>
            </View>
            <View style={styles.section}>
                <SectionHeader>Other</SectionHeader>

                <LogoutWidget />
            </View>
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
