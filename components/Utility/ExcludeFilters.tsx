import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import {PALETTE} from '@/constants';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {toggleExclude} from '@/store/slices/product';

const ExcludeFilters = () => {
    const dispatch = useAppDispatch();

    const excludeDeleted = useAppSelector(
        state => state.product.unsaved.filters.excludeDeleted,
    );
    const excludeSaved = useAppSelector(
        state => state.product.unsaved.filters.excludeSaved,
    );

    const toggle = (payload: 'saved' | 'deleted') => {
        dispatch(toggleExclude(payload));
    };

    return (
        <View style={styles.columnsContainer}>
            <View style={styles.column}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        excludeDeleted
                            ? styles.activeButton
                            : styles.inactiveButton,
                    ]}
                    onPress={() => {
                        toggle('deleted');
                    }}>
                    {excludeDeleted ? (
                        <Ionicons
                            name="checkmark"
                            color="#f3fcfa"
                            size={16}
                            style={styles.excludeButtonEmptyCol}
                        />
                    ) : (
                        <View style={styles.excludeButtonEmptyCol} />
                    )}
                    <Text
                        style={[
                            styles.buttonText,
                            excludeDeleted
                                ? styles.activeButtonText
                                : styles.inactiveButtonText,
                        ]}>
                        Exclude Deleted
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.column}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        excludeSaved
                            ? styles.activeButton
                            : styles.inactiveButton,
                    ]}
                    onPress={() => {
                        toggle('saved');
                    }}>
                    <Text
                        style={[
                            styles.buttonText,
                            excludeSaved
                                ? styles.activeButtonText
                                : styles.inactiveButtonText,
                        ]}>
                        Exclude Saved
                    </Text>
                    {excludeSaved ? (
                        <Ionicons
                            name="checkmark"
                            color="#f3fcfa"
                            size={16}
                            style={styles.excludeButtonEmptyCol}
                        />
                    ) : (
                        <View style={styles.excludeButtonEmptyCol} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    columnsContainer: {
        flexDirection: 'row',
    },
    column: {
        flex: 1,
        marginBottom: 10,
        padding: 5,
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: PALETTE.neutral[8],
        flexDirection: 'row',
    },
    activeButton: {
        backgroundColor: PALETTE.neutral[8],
    },
    inactiveButton: {},
    buttonText: {
        fontWeight: '600',
        color: '#f3fcfa',
    },
    activeButtonText: {},
    inactiveButtonText: {
        color: '#1a1f25',
    },
    excludeButtonEmptyCol: {},
});

export default ExcludeFilters;
