import React, {useRef, useState} from 'react';
import dayjs from 'dayjs';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
} from 'react-native';
import {PALETTE} from '@/constants';
import {useAppSelector} from '@/store/hooks';
import SetGender from '@/components/User/Modals/SetGender';
import SetCountry from './Modals/SetCountry';

const UpdateDetailsWidget = () => {
    const [isLoading, setIsLoading] = useState(false);

    const user = useAppSelector(state => state.user.docData);

    const [name, setName] = useState(user?.name || '');

    const GenderTouchableRef = useRef<TouchableOpacity>(null);
    const [gender, setGender] = useState(user?.gender || 'male');
    const [genderModalVisible, setGenderModalVisible] = useState(false);

    const [country, setCountry] = useState(user?.country || 'United States');
    const [countryModalVisible, setCountryModalVisible] = useState(false);

    const [dob, setDob] = useState(dayjs(user?.dob).format('YYYY-MM-DD'));
    const [dobModalVisible, setDobModalVisible] = useState(false);

    const updateUser = () => {
        setIsLoading(!isLoading);
        console.log(name);
    };

    return (
        <View>
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
                <TouchableOpacity
                    ref={GenderTouchableRef}
                    style={[styles.textInput, styles.borderTop]}
                    onPress={() => setGenderModalVisible(true)}>
                    <Text>{gender[0].toUpperCase() + gender.substring(1)}</Text>
                </TouchableOpacity>
                <SetGender
                    visible={genderModalVisible}
                    setVisible={setGenderModalVisible}
                    selectedValue={gender}
                    setSelectedValue={setGender}
                    touchableRef={GenderTouchableRef}
                />
                <TouchableOpacity
                    style={[styles.textInput, styles.borderTop]}
                    onPress={() => setCountryModalVisible(true)}>
                    <Text>{country}</Text>
                </TouchableOpacity>
                <SetCountry
                    visible={countryModalVisible}
                    setVisible={() => setCountryModalVisible(false)}
                    setSelectedValue={setCountry}
                    selectedValue={country}
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
    );
};

const styles = StyleSheet.create({
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
    borderTop: {
        borderTopWidth: 1,
    },
});

export default UpdateDetailsWidget;
