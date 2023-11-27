import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    Text,
    RefreshControl,
} from 'react-native';

import CollapsibleSection from '@/components/Save/CollapsibleSection';
import CollectionListItem from '@/components/Save/CollectionListItem';
import SaveListItem from '@/components/Save/SaveListItem';
import SearchInput from '@/components/Utility/SearchInput';
import {PALETTE} from '@/constants';
import {useSharedSavedContext} from '@/context/saved';
import {SavedStackParamList} from '@/nav/SavedNavigator';

export const INITIAL_SAVE_LOAD_AMOUNT = 10;
export const SUBSEQUENT_SAVE_LOAD_AMOUNT = 10;

const SavedHome = (_: StackScreenProps<SavedStackParamList, 'SavedHome'>) => {
    const [searchText, setSearchText] = useState('');

    const {
        initFetchCollections,
        fetchSaves,
        collections,
        saves,
        loadingSavesState,
        isLoadingCollections,
        hasInitiallyLoadedSaves,
        hasInitiallyLoadedCollections,
        collectionsExpanded,
        setCollectionsExpanded,
    } = useSharedSavedContext();

    const filteredCollections = useMemo(() => {
        return collections.filter(collection =>
            collection.name.includes(searchText),
        );
    }, [collections, searchText]);

    const filteredSaves = useMemo(() => {
        return saves.filter(save => save.name.includes(searchText));
    }, [saves, searchText]);

    useEffect(() => {
        if (!hasInitiallyLoadedCollections) {
            initFetchCollections();
        }

        if (!hasInitiallyLoadedSaves) {
            fetchSaves(INITIAL_SAVE_LOAD_AMOUNT, 'initial');
        }
    }, [
        fetchSaves,
        initFetchCollections,
        hasInitiallyLoadedSaves,
        hasInitiallyLoadedCollections,
    ]);

    const refresh = async () => {
        fetchSaves(INITIAL_SAVE_LOAD_AMOUNT, 'refresh');
    };

    const isLoading = useMemo<boolean>(() => {
        if (loadingSavesState === 'load' || isLoadingCollections) {
            return true;
        }

        return false;
    }, [loadingSavesState, isLoadingCollections]);

    return (
        <View style={styles.scrollContainer}>
            <View style={styles.searchContainer}>
                <SearchInput
                    value={searchText}
                    onChangeText={setSearchText}
                    onClearPress={() => setSearchText('')}
                />
            </View>

            {!isLoading ? (
                <FlatList
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="never"
                    ListHeaderComponent={
                        <>
                            <CollapsibleSection
                                headerText="Collections"
                                onHeaderPress={() =>
                                    setCollectionsExpanded(!collectionsExpanded)
                                }
                                expanded={collectionsExpanded}>
                                {filteredCollections.map(collection => (
                                    <CollectionListItem
                                        collection={collection}
                                        key={collection.id}
                                    />
                                ))}
                            </CollapsibleSection>
                            <View style={styles.headerContainer}>
                                <Text style={styles.headerText}>Saves</Text>
                            </View>
                        </>
                    }
                    refreshControl={
                        <RefreshControl
                            onRefresh={refresh}
                            refreshing={loadingSavesState === 'refresh'}
                        />
                    }
                    refreshing={loadingSavesState === 'refresh'}
                    data={filteredSaves}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({item}) => (
                        <SaveListItem save={item} key={item.id.toString()} />
                    )}
                    ListFooterComponent={
                        loadingSavesState === 'additional' ? (
                            <ActivityIndicator
                                style={styles.loadingMoreIndicator}
                            />
                        ) : undefined
                    }
                    onEndReached={
                        loadingSavesState !== 'additional' &&
                        loadingSavesState !== 'complete'
                            ? () => {
                                  fetchSaves(
                                      SUBSEQUENT_SAVE_LOAD_AMOUNT,
                                      'loadMore',
                                  );
                              }
                            : undefined
                    }
                />
            ) : (
                <ActivityIndicator />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
        flex: 1,
        width: '100%',
    },
    headerContainer: {
        backgroundColor: PALETTE.neutral[1],
        paddingVertical: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: PALETTE.neutral[2],
    },
    headerText: {
        fontWeight: '400',
        fontSize: 14,
    },
    loadingMoreIndicator: {
        marginTop: 10,
    },
});

export default SavedHome;
