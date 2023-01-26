import React from 'react';
import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {useAppSelector} from '@/store/hooks';
import {StackScreenProps} from '@react-navigation/stack';
import {View, Text, TextInput, StyleSheet, ScrollView} from 'react-native';
import {PALETTE} from '@/constants';

import SectionHeader from '@/components/Utility/SectionHeader';
import UpdateDetailsWidget from '@/components/User/UpdateDetailsWidget';
import UpdatePasswordWidget from '@/components/Options/UpdatePasswordWidget';

const UpdateDetail: React.FC<
    StackScreenProps<OptionsStackParamList, 'UpdateDetail'>
> = () => {
    const user = useAppSelector(state => state.user.docData);

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
                <UpdateDetailsWidget />
            </View>

            <View style={[styles.section, styles.topMargin]}>
                <SectionHeader>Update Password</SectionHeader>
                <UpdatePasswordWidget invertButton={true} />
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
