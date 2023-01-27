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
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import SetGender from '@/components/User/Modals/SetGender';
import SetCountry from './Modals/SetCountry';
import {COUNTRIES, CURRENCIES} from '@/constants/countries';
import SetDob from './Modals/SetDob';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import {UPDATE_USER} from '@/store/slices/user';
import SetCurrency from './Modals/SetCurrency';

const UpdateDetailsWidget = () => {
    const [isLoading, setIsLoading] = useState(false);

    const user = useAppSelector(state => state.user.docData);
    const dispatch = useAppDispatch();

    const [name, setName] = useState(user?.name || '');

    const GenderTouchableRef = useRef<TouchableOpacity>(null);
    const [gender, setGender] = useState(user?.gender || 'male');
    const [genderModalVisible, setGenderModalVisible] = useState(false);

    const [country, setCountry] = useState(user?.country || 'GB');
    const [countryModalVisible, setCountryModalVisible] = useState(false);

    const DobTouchableRef = useRef<TouchableOpacity>(null);
    const [dob, setDob] = useState(user?.dob ? new Date(user.dob) : new Date());
    const [dobModalVisible, setDobModalVisible] = useState(false);

    const CurrencyTouchableRef = useRef<TouchableOpacity>(null);
    const [currency, setCurrency] = useState(user?.currency || 'GBP');
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

    dayjs.extend(advancedFormat);

    const updateUser = async () => {
        setIsLoading(true);

        await dispatch(
            UPDATE_USER({
                email: user?.email || '',
                dob: dayjs(dob).format('YYYY-MM-DD'),
                name,
                gender,
                country,
                currency,
            }),
        );

        setIsLoading(false);
    };

    const matchCountryAndCurrency = (c: keyof typeof COUNTRIES) => {
        switch (c) {
            case 'AU':
                setCurrency('AUD');
                break;
            case 'GB':
                setCurrency('GBP');
                break;
            case 'CA':
                setCurrency('CAD');
                break;
            case 'US':
                setCurrency('USD');
                break;
            case 'DE':
                setCurrency('EUR');
                break;
            case 'FR':
                setCurrency('EUR');
                break;
            // TODO: Countries within Euro.
        }

        setCountry(c);
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
                    <Text>
                        {COUNTRIES[country].emoji} {COUNTRIES[country].name}
                    </Text>
                </TouchableOpacity>
                <SetCountry
                    visible={countryModalVisible}
                    setVisible={() => setCountryModalVisible(false)}
                    setSelectedValue={matchCountryAndCurrency}
                    selectedValue={country}
                />
                <TouchableOpacity
                    ref={CurrencyTouchableRef}
                    style={[styles.textInput, styles.borderTop]}
                    onPress={() => setCurrencyModalVisible(true)}>
                    <Text>
                        {CURRENCIES[currency].emoji} {CURRENCIES[currency].name}{' '}
                        ({CURRENCIES[currency].symbol})
                    </Text>
                </TouchableOpacity>
                <SetCurrency
                    visible={currencyModalVisible}
                    setVisible={() => setCurrencyModalVisible(false)}
                    setSelectedValue={setCurrency}
                    selectedValue={currency}
                    touchableRef={CurrencyTouchableRef}
                />
                <TouchableOpacity
                    ref={DobTouchableRef}
                    style={[styles.textInput, styles.borderTop]}
                    onPress={() => setDobModalVisible(true)}>
                    <Text>{dayjs(dob).format('Do MMMM, YYYY')}</Text>
                </TouchableOpacity>
                <SetDob
                    visible={dobModalVisible}
                    setVisible={setDobModalVisible}
                    selectedValue={dob}
                    setSelectedValue={setDob}
                    touchableRef={DobTouchableRef}
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
