import {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';

import SaveListItem from '@/components/Save/SaveListItem';
import SearchInput from '@/components/Utility/SearchInput';
import {SavedStackParamList} from '@/nav/SavedNavigator';

const CollectionView = ({
    route,
}: StackScreenProps<SavedStackParamList, 'CollectionView'>) => {
    const [searchText, setSearchText] = useState('');

    const filteredProducts = useMemo(() => {
        return route.params.products.filter(product =>
            product.name.includes(searchText),
        );
    }, [route.params, searchText]);

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <SearchInput
                    value={searchText}
                    onChangeText={setSearchText}
                    onClearPress={() => setSearchText('')}
                />
            </View>

            <ScrollView style={styles.scrollContainer}>
                {filteredProducts.map(product => (
                    <SaveListItem save={product} key={product.id} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
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
        width: '100%',
    },
});

export default CollectionView;
