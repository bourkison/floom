import {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {
    ScrollView,
    Text,
    StyleSheet,
    TouchableHighlight,
    View,
} from 'react-native';

import SetGender from '@/components/User/SetGender';
import {PALETTE} from '@/constants';
import {FiltersStackParamList} from '@/nav/FiltersNavigator';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {setGender} from '@/store/slices/product';
import ExcludeFilters from '@/components/Utility/ExcludeFilters';

const TOUCHABLE_UNDERLAY = PALETTE.neutral[2];
const TOUCHABLE_ACTIVE_OPACITY = 0.7;

const FiltersHome = ({
    navigation,
}: StackScreenProps<FiltersStackParamList, 'FiltersHome'>) => {
    const dispatch = useAppDispatch();

    const selectedBrands = useAppSelector(
        state => state.product.unsaved.filters.brand,
    );

    const selectedColors = useAppSelector(
        state => state.product.unsaved.filters.color,
    );

    const selectedGender = useAppSelector(
        state => state.product.unsaved.filters.gender,
    );

    const selectedCategories = useAppSelector(
        state => state.product.unsaved.filters.category,
    );

    const brandText = useMemo<string>(() => {
        if (selectedBrands.length === 0) {
            return 'All';
        }

        if (selectedBrands.length === 1) {
            return selectedBrands[0].name;
        }

        return `${selectedBrands.length} selected`;
    }, [selectedBrands]);

    const colorText = useMemo<string>(() => {
        if (selectedColors.length === 0) {
            return 'All';
        }

        if (selectedColors.length === 1) {
            return selectedColors[0];
        }

        return `${selectedColors.length} selected`;
    }, [selectedColors]);

    const categoryText = useMemo<string>(() => {
        if (selectedCategories.length === 0) {
            return 'All';
        }

        if (selectedCategories.length === 1) {
            return selectedCategories[0];
        }

        return `${selectedCategories.length} selected`;
    }, [selectedCategories]);

    const priceText = useMemo<string>(() => {
        return 'Any';
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.listContainer}>
                <View style={styles.genderContainer}>
                    <SetGender
                        value={selectedGender}
                        onChange={gender =>
                            dispatch(setGender({obj: 'unsaved', gender}))
                        }
                    />
                </View>

                <TouchableHighlight
                    underlayColor={TOUCHABLE_UNDERLAY}
                    activeOpacity={TOUCHABLE_ACTIVE_OPACITY}
                    onPress={() => navigation.navigate('Brand')}
                    style={styles.touchable}>
                    <View style={styles.touchableContentContainer}>
                        <View>
                            <Text style={[styles.text, styles.title]}>
                                Brand
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.text}>{brandText}</Text>
                        </View>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight
                    underlayColor={TOUCHABLE_UNDERLAY}
                    activeOpacity={TOUCHABLE_ACTIVE_OPACITY}
                    onPress={() => navigation.navigate('Color')}
                    style={[styles.touchable, styles.noBorder]}>
                    <View style={styles.touchableContentContainer}>
                        <View>
                            <Text style={[styles.text, styles.title]}>
                                Colours
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.text}>{colorText}</Text>
                        </View>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight
                    underlayColor={TOUCHABLE_UNDERLAY}
                    activeOpacity={TOUCHABLE_ACTIVE_OPACITY}
                    onPress={() => navigation.navigate('Category')}
                    style={[styles.touchable, styles.noBorder]}>
                    <View style={styles.touchableContentContainer}>
                        <View>
                            <Text style={[styles.text, styles.title]}>
                                Product Type
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.text}>{categoryText}</Text>
                        </View>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight
                    underlayColor={TOUCHABLE_UNDERLAY}
                    activeOpacity={TOUCHABLE_ACTIVE_OPACITY}
                    onPress={() => navigation.navigate('Price')}
                    style={[styles.touchable, styles.noBorder]}>
                    <View style={styles.touchableContentContainer}>
                        <View>
                            <Text style={[styles.text, styles.title]}>
                                Price
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.text}>{priceText}</Text>
                        </View>
                    </View>
                </TouchableHighlight>

                <View style={styles.excludeContainer}>
                    <ExcludeFilters />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 25,
    },
    listContainer: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 0,
        },
    },
    genderContainer: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        backgroundColor: '#FFF',
        paddingHorizontal: 25,
        paddingVertical: 25,
        marginBottom: 25,
    },
    genderTextContainer: {
        marginTop: -10,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    touchable: {},
    touchableContentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: PALETTE.neutral[2],
    },
    noBorder: {
        borderColor: 'transparent',
    },
    text: {
        fontSize: 16,
        fontWeight: '300',
    },
    title: {
        fontWeight: '500',
    },
    excludeContainer: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        backgroundColor: '#FFF',
        paddingHorizontal: 25,
        paddingVertical: 25,
        marginTop: 25,
    },
});

export default FiltersHome;
