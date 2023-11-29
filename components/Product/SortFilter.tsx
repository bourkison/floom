import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import {PALETTE} from '@/constants';

export const FILTERS_HEIGHT = 44;

type SortFilterProps = {
    obj: 'saved' | 'unsaved' | 'deleted';
};

const SortFilter = (_: SortFilterProps) => {
    const navigation = useNavigation();

    const expandFilters = () => {
        navigation.navigate('Filters', {screen: 'FiltersHome'});
    };

    return (
        <View style={styles.container}>
            <View style={[styles.sectionContainer, styles.sortContainer]}>
                <Text style={styles.header}>Sort</Text>
            </View>

            <TouchableOpacity
                style={[styles.sectionContainer, styles.filtersContainer]}
                onPress={expandFilters}>
                <Text style={styles.header}>Filter</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: FILTERS_HEIGHT,
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: -1,
            width: -1,
        },
        shadowOpacity: 0.3,
        backgroundColor: '#FFF',
    },
    sectionContainer: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: PALETTE.neutral[1],
    },
    sortContainer: {
        borderRightWidth: 1,
    },
    filtersContainer: {
        borderLeftWidth: 1,
    },
    header: {
        fontWeight: '500',
        color: PALETTE.neutral[8],
    },
});

export default SortFilter;
