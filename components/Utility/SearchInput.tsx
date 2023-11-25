import {Ionicons, Feather} from '@expo/vector-icons';
import React from 'react';
import {View, TextInput, Pressable, StyleSheet} from 'react-native';

import {PALETTE} from '@/constants';

type SearchInputProps = {
    value: string;
    onChangeText: (val: string) => void;
    onSubmitEditing?: () => void;
    onClearPress: () => void;
};

const SearchInput = ({
    value,
    onChangeText,
    onSubmitEditing,
    onClearPress,
}: SearchInputProps) => {
    return (
        <View style={styles.searchSection}>
            <Ionicons
                name="search"
                style={styles.searchIcon}
                color={PALETTE.neutral[0]}
            />

            <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor={PALETTE.neutral[3]}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmitEditing}
                value={value}
                returnKeyType="search"
                selectTextOnFocus={true}
            />

            {value.length > 0 && (
                <Pressable onPress={onClearPress}>
                    <Feather
                        name="x-circle"
                        style={styles.searchIcon}
                        color={PALETTE.neutral[0]}
                        size={14}
                    />
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    searchSection: {
        backgroundColor: PALETTE.neutral[5],
        borderRadius: 5,
        marginVertical: 5,
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        color: PALETTE.neutral[0],
        fontSize: 14,
        alignSelf: 'center',
        paddingVertical: 5,
        flex: 1,
    },
    searchIcon: {
        paddingHorizontal: 5,
    },
});

export default SearchInput;
