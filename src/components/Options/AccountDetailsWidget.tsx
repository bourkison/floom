import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useAppSelector} from '@/store/hooks';
import {PALETTE} from '@/constants';
import {capitaliseString} from '@/services';
import dayjs from 'dayjs';

type OptionProps = {
    header: string;
    value: string;
    bottomBorder: boolean;
    onPress?: () => void;
};

const AccountDetailsWidget = () => {
    const user = useAppSelector(state => state.user.docData);

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
        <View style={styles.container}>
            <View style={styles.box}>
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
                    value={user?.country || ''}
                    bottomBorder={true}
                />
                <Option
                    header="DOB"
                    value={dayjs(user?.dob).format('YYYY/MM/DD') || ''}
                    bottomBorder={false}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 5,
    },
    box: {
        borderWidth: 1,
        borderColor: PALETTE.neutral[5],
        borderRadius: 4,
        backgroundColor: PALETTE.neutral[0],
    },
    optionLink: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: PALETTE.neutral[3],
    },
    optionHeaderContainer: {},
    optionHeader: {
        fontWeight: 'bold',
    },
    optionValueContainer: {
        flex: 1,
        alignSelf: 'flex-end',
    },
    optionValue: {
        textAlign: 'right',
    },
});

export default AccountDetailsWidget;
