import React, {useState} from 'react';
import {Text, ScrollView, StyleSheet, View} from 'react-native';
import TextInput from '@/components/Utility/TextInput';
import SectionHeader from '@/components/Utility/SectionHeader';
import {useAppSelector} from '@/store/hooks';
import UpdatePasswordWidget from '@/components/Options/UpdatePasswordWidget';
import DeletedProductsWidget from '@/components/Options/DeletedProductsWidget';

const Options = () => {
    const user = useAppSelector(state => state.user.docData);
    const [name, setName] = useState(user?.name || '');

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
                <UpdatePasswordWidget />
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
});

export default Options;
