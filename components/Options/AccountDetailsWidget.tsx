import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';

import {GENDER_OPTIONS, PALETTE} from '@/constants';
import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {useAppSelector} from '@/store/hooks';

type OptionProps = {
    header: string;
    value: string;
    bottomBorder: boolean;
};

const Option: React.FC<OptionProps> = ({header, value, bottomBorder}) => {
    const borderBottomWidth = bottomBorder ? 1 : 0;

    return (
        <View style={[styles.optionLink, {borderBottomWidth}]}>
            <View style={styles.optionHeaderContainer}>
                <Text style={styles.optionHeader}>{header}</Text>
            </View>
            <View style={styles.optionValueContainer}>
                <Text style={styles.optionValue}>{value}</Text>
            </View>
        </View>
    );
};

const AccountDetailsWidget = () => {
    const user = useAppSelector(state => state.user.userData);
    const navigation =
        useNavigation<StackNavigationProp<OptionsStackParamList>>();

    dayjs.extend(advancedFormat);

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
                value={
                    GENDER_OPTIONS.filter(g => g.value === user?.gender)[0]
                        ?.label || ''
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
