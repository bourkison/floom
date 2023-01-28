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
import {UserDocData} from '@/types/user';
import {FontAwesome5, Foundation} from '@expo/vector-icons';
import Feedback from '@/components/Utility/Feedback';

type UpdateDetailsWidgetProps = {
    name: string;
    setName: (name: string) => void;
    gender: UserDocData['gender'] | '';
    setGender: (gender: UserDocData['gender']) => void;
    country: UserDocData['country'] | '';
    setCountry: (country: UserDocData['country']) => void;
    dob: Date;
    setDob: (dob: Date) => void;
    currency: UserDocData['currency'] | '';
    setCurrency: (currency: UserDocData['currency']) => void;
    isUpdate: boolean;
};

const UpdateDetailsWidget: React.FC<UpdateDetailsWidgetProps> = ({
    name,
    setName,
    gender,
    setGender,
    country,
    setCountry,
    dob,
    setDob,
    currency,
    setCurrency,
    isUpdate,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const user = useAppSelector(state => state.user.docData);
    const dispatch = useAppDispatch();

    const GenderTouchableRef = useRef<TouchableOpacity>(null);
    const [genderModalVisible, setGenderModalVisible] = useState(false);

    const [countryModalVisible, setCountryModalVisible] = useState(false);

    const DobTouchableRef = useRef<TouchableOpacity>(null);
    const [dobModalVisible, setDobModalVisible] = useState(false);

    const CurrencyTouchableRef = useRef<TouchableOpacity>(null);
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState<
        'success' | 'warning' | 'error'
    >('success');

    dayjs.extend(advancedFormat);

    const updateUser = async () => {
        if (isUpdate && gender && country && currency) {
            setIsLoading(true);

            try {
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

                setFeedbackType('success');
                setFeedbackMessage('Details updated.');
                setFeedbackVisible(true);
            } catch (err: any) {
                console.error(err);
                setFeedbackType('error');
                setFeedbackMessage(
                    err?.message || 'Error updating user details.',
                );
                setFeedbackVisible(true);
            } finally {
                setIsLoading(false);
            }
        }
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
                    <View style={styles.fdRow}>
                        {gender ? (
                            <Text style={styles.flexOne}>
                                {gender[0].toUpperCase() + gender.substring(1)}
                            </Text>
                        ) : (
                            <Text style={[styles.placeholder, styles.flexOne]}>
                                Preferred Style
                            </Text>
                        )}
                        <View style={styles.caretIcon}>
                            {genderModalVisible ? (
                                <FontAwesome5 name="caret-up" />
                            ) : (
                                <FontAwesome5 name="caret-down" />
                            )}
                        </View>
                    </View>
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
                    <View style={styles.fdRow}>
                        {country ? (
                            <Text style={styles.flexOne}>
                                {COUNTRIES[country].emoji}{' '}
                                {COUNTRIES[country].name}
                            </Text>
                        ) : (
                            <Text style={[styles.placeholder, styles.flexOne]}>
                                Country
                            </Text>
                        )}
                        <View style={styles.caretIcon}>
                            <Foundation name="list" />
                        </View>
                    </View>
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
                    <View style={styles.fdRow}>
                        {currency ? (
                            <Text style={styles.flexOne}>
                                {CURRENCIES[currency].emoji}{' '}
                                {CURRENCIES[currency].name}{' '}
                                {CURRENCIES[currency].symbol}
                            </Text>
                        ) : (
                            <Text style={[styles.placeholder, styles.flexOne]}>
                                Preferred currency
                            </Text>
                        )}
                        <View style={styles.caretIcon}>
                            {currencyModalVisible ? (
                                <FontAwesome5 name="caret-up" />
                            ) : (
                                <FontAwesome5 name="caret-down" />
                            )}
                        </View>
                    </View>
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
                    <View style={styles.fdRow}>
                        <Text style={styles.flexOne}>
                            {dayjs(dob).format('Do MMMM, YYYY')}
                        </Text>
                        <View style={styles.caretIcon}>
                            {dobModalVisible ? (
                                <FontAwesome5 name="caret-up" />
                            ) : (
                                <FontAwesome5 name="caret-down" />
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
                <SetDob
                    visible={dobModalVisible}
                    setVisible={setDobModalVisible}
                    selectedValue={dob}
                    setSelectedValue={setDob}
                    touchableRef={DobTouchableRef}
                />
            </View>
            {isUpdate ? (
                <View>
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
                    <Feedback
                        type={feedbackType}
                        message={feedbackMessage}
                        displayTime={5000}
                        visible={feedbackVisible}
                        onFinish={() => {
                            setFeedbackMessage('');
                            setFeedbackType('success');
                            setFeedbackVisible(false);
                        }}
                        containerStyle={styles.feedbackContainer}
                    />
                </View>
            ) : undefined}
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
    placeholder: {
        color: PALETTE.neutral[3],
    },
    caretIcon: {paddingRight: 5},
    fdRow: {flexDirection: 'row'},
    flexOne: {flex: 1},
    feedbackContainer: {padding: 10},
});

export default UpdateDetailsWidget;
