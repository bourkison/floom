import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

import {PALETTE} from '@/constants';
import {Gender} from '@/types';

type SetGenderProps = {
    style?: ViewStyle;
    value: Gender;
    onChange: (val: Gender) => void;
};

export default function SetGender({value, onChange, style}: SetGenderProps) {
    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                disabled={value === 'both'}
                onPress={() => onChange('both')}
                style={[
                    styles.button,
                    styles.bothButton,
                    value === 'both'
                        ? styles.activeButton
                        : styles.inactiveButton,
                ]}>
                <Text
                    style={[
                        styles.buttonText,
                        value === 'both'
                            ? styles.activeButtonText
                            : styles.inactiveButtonText,
                    ]}>
                    Both
                </Text>
            </TouchableOpacity>

            <View style={styles.genderedButtonsContainer}>
                <TouchableOpacity
                    onPress={() => onChange('male')}
                    style={[
                        styles.button,
                        styles.genderedButton,
                        value === 'male'
                            ? styles.activeButton
                            : styles.inactiveButton,
                    ]}>
                    <Text
                        style={[
                            styles.buttonText,
                            value === 'male'
                                ? styles.activeButtonText
                                : styles.inactiveButtonText,
                        ]}>
                        Male
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onChange('female')}
                    style={[
                        styles.button,
                        styles.genderedButton,
                        value === 'female'
                            ? styles.activeButton
                            : styles.inactiveButton,
                    ]}>
                    <Text
                        style={[
                            styles.buttonText,
                            value === 'female'
                                ? styles.activeButtonText
                                : styles.inactiveButtonText,
                        ]}>
                        Female
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    button: {
        paddingVertical: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        borderWidth: 1,
        borderColor: PALETTE.neutral[8],
    },
    bothButton: {
        width: '100%',
    },
    genderedButtonsContainer: {
        flexDirection: 'row',
        marginTop: 10,
        marginHorizontal: -5,
    },
    genderedButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    activeButton: {
        backgroundColor: PALETTE.neutral[8],
    },
    inactiveButton: {},
    buttonText: {
        fontWeight: '600',
    },
    activeButtonText: {
        color: PALETTE.gray[1],
    },
    inactiveButtonText: {},
});
