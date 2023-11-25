import {Ionicons} from '@expo/vector-icons';
import React, {useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableHighlight,
    ActivityIndicator,
} from 'react-native';

import SearchInput from '@/components/Utility/SearchInput';
import {PALETTE} from '@/constants';
import {supabase} from '@/services/supabase';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {toggleBrand} from '@/store/slices/product';

const TOUCHABLE_UNDERLAY = PALETTE.neutral[2];
const TOUCHABLE_ACTIVE_OPACITY = 0.7;

type BrandListItemProps = {
    brand: {
        id: number;
        name: string;
    };
};

const BrandListItem = ({brand}: BrandListItemProps) => {
    const dispatch = useAppDispatch();

    const selectedBrands = useAppSelector(
        state => state.product.unsaved.filters.brand,
    );

    const isSelected = useMemo(() => {
        const index = selectedBrands.findIndex(
            selected => selected.id === brand.id,
        );

        return !(index < 0);
    }, [selectedBrands, brand]);

    const toggle = () => {
        dispatch(toggleBrand({obj: 'unsaved', brand}));
    };

    return (
        <TouchableHighlight
            onPress={toggle}
            underlayColor={TOUCHABLE_UNDERLAY}
            activeOpacity={TOUCHABLE_ACTIVE_OPACITY}>
            <View key={brand.id.toString()} style={styles.listItemContainer}>
                <View>
                    <Text style={styles.brandText}>{brand.name}</Text>
                </View>
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

const Brand = () => {
    const [searchText, setSearchText] = useState('');
    const [availableBrands, setAvailableBrands] = useState<
        {id: number; name: string}[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            setIsLoading(true);

            const {data, error} = await supabase.from('brands').select();

            setIsLoading(false);

            if (error) {
                // TODO: Handle error.
                console.error(error);
                return;
            }

            setAvailableBrands(
                data.map(brand => ({id: brand.id, name: brand.name})),
            );

            console.log(data);
        };

        fetchBrands();
    }, []);

    const filteredSortedBrands = useMemo(() => {
        return availableBrands
            .filter(brand => brand.name.includes(searchText))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [availableBrands, searchText]);

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <SearchInput
                    value={searchText}
                    onChangeText={setSearchText}
                    onClearPress={() => setSearchText('')}
                />
            </View>

            {!isLoading ? (
                <ScrollView style={styles.scrollContainer}>
                    <View style={styles.listContainer}>
                        {filteredSortedBrands.map(brand => (
                            <BrandListItem
                                brand={brand}
                                key={brand.id.toString()}
                            />
                        ))}
                    </View>
                </ScrollView>
            ) : (
                <ActivityIndicator style={styles.activityIndicator} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        width: '100%',
        flexBasis: 50,
        backgroundColor: '#FFF',
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: -1,
            width: -1,
        },
        shadowOpacity: 0.3,
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
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: PALETTE.neutral[2],
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandText: {
        fontSize: 16,
        fontWeight: '500',
    },
    activityIndicator: {
        marginTop: 25,
    },
});

export default Brand;
