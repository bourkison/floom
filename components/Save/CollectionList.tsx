import React from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    FlatList,
    RefreshControl,
} from 'react-native';

import CollectionListItem from '@/components/Save/CollectionListItem';
import {useSharedSavedContext} from '@/context/saved';

const CollectionList = () => {
    const {collections, loadingCollectionsState, fetchCollections} =
        useSharedSavedContext();

    return (
        <View style={styles.container}>
            {loadingCollectionsState !== 'load' ? (
                <FlatList
                    data={collections}
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
                />
            ) : (
                <ActivityIndicator />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
});

export default CollectionList;
