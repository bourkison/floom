import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {useAppSelector} from '@/store/hooks';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, ScrollView} from 'react-native';
import {PALETTE} from '@/constants';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import SectionHeader from '@/components/Utility/SectionHeader';
import dayjs from 'dayjs';
import UpdatePasswordWidget from '@/components/Options/UpdatePasswordWidget';

const UpdateDetail: React.FC<
    StackScreenProps<OptionsStackParamList, 'UpdateDetail'>
> = () => {
    const user = useAppSelector(state => state.user.docData);

    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState(user?.name || '');
    const [gender, setGender] = useState(
        user?.gender && user?.gender
            ? user?.gender[0].toUpperCase() + user?.gender.substring(1)
            : '' || '',
    );
    const [country, setCountry] = useState(user?.country || '');
    const [dob, setDob] = useState(dayjs(user?.dob).format('YYYY-MM-DD'));

    const updateUser = () => {
        setIsLoading(!isLoading);
        console.log(name);
    };

    return (
        <ScrollView>
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
                <View style={styles.box}>
                    <TextInput
                        placeholder="Name"
                        placeholderTextColor={PALETTE.neutral[3]}
                        onChangeText={setName}
                        autoCapitalize="sentences"
                        autoComplete="name"
                        autoCorrect={false}
                        value={name}
                        style={styles.textInput}
                        editable={!isLoading}
                    />
                    <TextInput
                        placeholder="Gender"
                        placeholderTextColor={PALETTE.neutral[3]}
                        onChangeText={setGender}
                        autoCapitalize="sentences"
                        autoComplete="name"
                        autoCorrect={false}
                        value={gender}
                        style={[styles.textInput, styles.borderTop]}
                        editable={!isLoading}
                    />
                    <TextInput
                        placeholder="Name"
                        placeholderTextColor={PALETTE.neutral[3]}
                        onChangeText={setCountry}
                        autoCapitalize="sentences"
                        autoComplete="name"
                        autoCorrect={false}
                        value={country}
                        style={[styles.textInput, styles.borderTop]}
                        editable={!isLoading}
                    />
                    <TextInput
                        placeholder="Country"
                        placeholderTextColor={PALETTE.neutral[3]}
                        onChangeText={setDob}
                        autoCapitalize="sentences"
                        autoComplete="name"
                        autoCorrect={false}
                        value={dob}
                        style={[styles.textInput, styles.borderTop]}
                        editable={!isLoading}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <AnimatedButton
                        onPress={updateUser}
                        style={styles.updateButton}
                        textStyle={styles.updateButtonText}
                        disabled={isLoading}>
                        {isLoading ? (
                            <Spinner
                                diameter={14}
                                spinnerWidth={2}
                                backgroundColor="#1a1f25"
                                spinnerColor="#f3fcfa"
                            />
                        ) : (
                            'Update Details'
                        )}
                    </AnimatedButton>
                </View>
            </View>
            <View style={[styles.section, {marginTop: 20}]}>
                <SectionHeader>Update Password</SectionHeader>
                <UpdatePasswordWidget invertButton={true} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        padding: 10,
    },
    updateButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    updateButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
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
    textInput: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: PALETTE.neutral[2],
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
    hintText: {
        color: PALETTE.gray[4],
        fontSize: 12,
        paddingHorizontal: 5,
        marginTop: 3,
    },
});

export default UpdateDetail;
