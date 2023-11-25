import {Ionicons} from '@expo/vector-icons';
import React, {useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {TouchableHighlight} from 'react-native-gesture-handler';

import {CATEGORY_OPTIONS, PALETTE} from '@/constants';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {toggleCategory} from '@/store/slices/product';

type CategoryProps = {
    category: (typeof CATEGORY_OPTIONS)[number];
};

const TOUCHABLE_UNDERLAY = PALETTE.neutral[2];
const TOUCHABLE_ACTIVE_OPACITY = 0.7;

const CategoryListItem = ({category}: CategoryProps) => {
    const dispatch = useAppDispatch();

    const selectedCategories = useAppSelector(
        state => state.product.unsaved.filters.category,
    );

    const isSelected = useMemo(() => {
        const index = selectedCategories.findIndex(
            selected => selected.value === category.value,
        );

        return !(index < 0);
    }, [selectedCategories, category]);

    const toggle = () => {
        dispatch(toggleCategory({obj: 'unsaved', category}));
    };

    return (
        <TouchableHighlight
            onPress={toggle}
            underlayColor={TOUCHABLE_UNDERLAY}
            activeOpacity={TOUCHABLE_ACTIVE_OPACITY}>
            <View style={styles.listItemContainer}>
                <Text style={styles.categoryText}>{category.label}</Text>
                {isSelected && (
                    <View>
                        <Ionicons
                            name="checkmark"
                            color={PALETTE.neutral[8]}
                            size={18}
                        />
                    </View>
                )}
            </View>
        </TouchableHighlight>
    );
};

const Category = () => {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.listContainer}>
                    {CATEGORY_OPTIONS.map(category => (
                        <CategoryListItem
                            category={category}
                            key={category.value}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        paddingVertical: 20,
    },
    listContainer: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 0,
        },
    },
    listItemContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderColor: PALETTE.neutral[2],
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 16,
        paddingVertical: 14,
        fontWeight: '500',
    },
});

export default Category;
