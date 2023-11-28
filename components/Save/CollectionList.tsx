import React, {useMemo, useState} from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    FlatList,
    RefreshControl,
} from 'react-native';

import CollectionListItem from '@/components/Save/CollectionListItem';
import SearchInput from '@/components/Utility/SearchInput';
import {PALETTE} from '@/constants';
import {useSharedSavedContext} from '@/context/saved';

const CollectionList = () => {
    const [searchText, setSearchText] = useState('');

    const {collections, loadingCollectionsState, fetchCollections} =
        useSharedSavedContext();

    const filteredCollections = useMemo(
        () =>
            collections.filter(collection =>
                collection.name.includes(searchText),
            ),
        [searchText, collections],
    );

    return (
        <View style={styles.container}>
            {loadingCollectionsState !== 'load' ? (
                <FlatList
                    data={filteredCollections}
                    keyExtractor={collection => collection.id.toString()}
                    renderItem={({item}) => (
                        <CollectionListItem collection={item} />
                    )}
                    refreshControl={
                        <RefreshControl
                            onRefresh={() => fetchCollections('refresh')}
                            refreshing={loadingCollectionsState === 'refresh'}
                        />
                    }
                    ListHeaderComponent={
                        <View style={styles.searchContainer}>
                            <SearchInput
                                style={styles.searchBox}
                                value={searchText}
                                onChangeText={setSearchText}
                                onClearPress={() => setSearchText('')}
                            />
                        </View>
                    }
                />
            ) : (
                <ActivityIndicator />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    searchBox: {
        paddingVertical: 2,
    },
    searchContainer: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        width: '100%',
        backgroundColor: '#FFF',
        borderColor: PALETTE.neutral[2],
        borderBottomWidth: 1,
    },
});

export default CollectionList;
