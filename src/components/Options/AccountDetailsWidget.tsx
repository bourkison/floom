import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useAppSelector} from '@/store/hooks';
import {PALETTE} from '@/constants';
import {capitaliseString} from '@/services';
import dayjs from 'dayjs';
import {StackNavigationProp} from '@react-navigation/stack';
import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {useNavigation} from '@react-navigation/native';
import {COUNTRIES, CURRENCIES} from '@/constants/countries';
import advancedFormat from 'dayjs/plugin/advancedFormat';

type OptionProps = {
    header: string;
    value: string;
    bottomBorder: boolean;
};

const AccountDetailsWidget = () => {
    const user = useAppSelector(state => state.user.docData);
    const navigation =
        useNavigation<StackNavigationProp<OptionsStackParamList>>();

    dayjs.extend(advancedFormat);

    const Option: React.FC<OptionProps> = ({header, value, bottomBorder}) => {
        return (
            <View
                style={[
                    styles.optionLink,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {borderBottomWidth: bottomBorder ? 1 : 0},
                ]}>
                <View style={styles.optionHeaderContainer}>
                    <Text style={styles.optionHeader}>{header}</Text>
                </View>
                <View style={styles.optionValueContainer}>
                    <Text style={styles.optionValue}>{value}</Text>
                </View>
            </View>
        );
    };

    return (
        <TouchableOpacity
            style={styles.box}
            activeOpacity={0.5}
            onPress={() => {
                navigation.navigate('UpdateDetail');
            }}>
            <Option
                header="Email"
                value={user?.email || ''}
                bottomBorder={true}
            />
            <Option
                header="Name"
                value={user?.name || ''}
                bottomBorder={true}
            />
            <Option
                header="Gender"
                value={capitaliseString(user?.gender || '')}
                bottomBorder={true}
            />
            <Option
                header="Country"
                value={
                    user?.country
                        ? COUNTRIES[user.country].name +
                          ' ' +
                          COUNTRIES[user.country].emoji
                        : ''
                }
                bottomBorder={true}
            />
            <Option
                header="Currency"
                value={
                    user?.currency
                        ? CURRENCIES[user.currency].name +
                          ' ' +
                          CURRENCIES[user.currency].emoji
                        : ''
                }
                bottomBorder={true}
            />
            <Option
                header="DOB"
                value={dayjs(user?.dob).format('Do MMMM, YYYY') || ''}
                bottomBorder={false}
            />
        </TouchableOpacity>
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
    optionLink: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: PALETTE.neutral[2],
    },
    optionHeaderContainer: {},
    optionHeader: {
        fontWeight: '500',
    },
    optionValueContainer: {
        flex: 1,
        alignSelf: 'flex-end',
    },
    optionValue: {
        textAlign: 'right',
        color: PALETTE.neutral[4],
    },
});

export default AccountDetailsWidget;
