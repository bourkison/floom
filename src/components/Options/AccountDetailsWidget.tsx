import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useAppSelector} from '@/store/hooks';
import {PALETTE} from '@/constants';
import {capitaliseString} from '@/services';
import dayjs from 'dayjs';
import {StackNavigationProp} from '@react-navigation/stack';
import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {useNavigation} from '@react-navigation/native';

type OptionProps = {
    header: string;
    value: string;
    bottomBorder: boolean;
    onPress?: () => void;
};

const AccountDetailsWidget = () => {
    const user = useAppSelector(state => state.user.docData);
    const navigation =
        useNavigation<StackNavigationProp<OptionsStackParamList>>();

    const Option: React.FC<OptionProps> = ({
        header,
        value,
        onPress,
        bottomBorder,
    }) => {
        return (
            <TouchableOpacity
                style={[
                    styles.optionLink,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {borderBottomWidth: bottomBorder ? 1 : 0},
                ]}
                onPress={onPress}
                activeOpacity={0.5}>
                <View style={styles.optionHeaderContainer}>
                    <Text style={styles.optionHeader}>{header}</Text>
                </View>
                <View style={styles.optionValueContainer}>
                    <Text style={styles.optionValue}>{value}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.box}>
            <Option
                header="Email"
                value={user?.email || ''}
                bottomBorder={true}
                onPress={() => {
                    navigation.navigate('UpdateDetail', {type: 'email'});
                }}
            />
            <Option
                header="Name"
                value={user?.name || ''}
                bottomBorder={true}
                onPress={() => {
                    navigation.navigate('UpdateDetail', {type: 'name'});
                }}
            />
            <Option
                header="Gender"
                value={capitaliseString(user?.gender || '')}
                bottomBorder={true}
            />
            <Option
                header="Country"
                value={user?.country || ''}
                bottomBorder={true}
            />
            <Option
                header="DOB"
                value={dayjs(user?.dob).format('YYYY/MM/DD') || ''}
                bottomBorder={false}
            />
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
