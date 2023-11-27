import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Text,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeOutDown,
    Layout,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AddToCollectionBottomSheet from '@/components/Save/AddToCollectionBottomSheet';
import CollapsibleSection from '@/components/Save/CollapsibleSection';
import CollectionListItem from '@/components/Save/CollectionListItem';
import SaveListItem from '@/components/Save/SaveListItem';
import SearchInput from '@/components/Utility/SearchInput';
import {DELETE_COLOR, PALETTE} from '@/constants';
import {useAddToCollectionContext} from '@/context/bottomSheet';
import {useSharedSavedContext} from '@/context/saved';
import {SavedStackParamList} from '@/nav/SavedNavigator';
import {Database} from '@/types/schema';

export const INITIAL_SAVE_LOAD_AMOUNT = 10;
export const SUBSEQUENT_SAVE_LOAD_AMOUNT = 10;

const SavedHome = (_: StackScreenProps<SavedStackParamList, 'SavedHome'>) => {
    const [searchText, setSearchText] = useState('');
    const [productsSelectable, setProductsSelectable] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<
        Database['public']['Views']['v_saves']['Row'][]
    >([]);

    const {bottom} = useSafeAreaInsets();

    const {
        initFetchCollections,
        fetchSaves,
        collections,
        saves,
        loadingSavesState,
        isLoadingCollections,
        hasInitiallyLoadedSaves,
        hasInitiallyLoadedCollections,
        deleteSavedProducts,
        setCollectionsExpanded,
        collectionsExpanded,
    } = useSharedSavedContext();

    const {openModal} = useAddToCollectionContext();

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

    const toggleSelectable = () => {
        if (productsSelectable) {
            setProductsSelectable(false);
            setSelectedProducts([]);

            return;
        }

        setProductsSelectable(true);
    };

    const selectProduct = (
        selected: Database['public']['Views']['v_saves']['Row'],
    ) => {
        const findIndex = selectedProducts.findIndex(
            product => selected.product_id === product.product_id,
        );

        if (findIndex < 0) {
            setSelectedProducts([...selectedProducts, selected]);
            return;
        }

        setSelectedProducts([
            ...selectedProducts.slice(0, findIndex),
            ...selectedProducts.slice(findIndex + 1),
        ]);
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
                <Animated.FlatList
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="never"
                    itemLayoutAnimation={Layout.duration(300)}
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
                                <Text style={styles.headerText}>
                                    {!productsSelectable
                                        ? 'Saves'
                                        : `${selectedProducts.length} selected`}
                                </Text>
                                <TouchableOpacity onPress={toggleSelectable}>
                                    <Text>
                                        {!productsSelectable
                                            ? 'Select'
                                            : 'Cancel'}
                                    </Text>
                                </TouchableOpacity>
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
                        <SaveListItem
                            selectable={productsSelectable}
                            selectedProducts={selectedProducts}
                            onSelect={selectProduct}
                            save={item}
                            key={item.id.toString()}
                        />
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

            {productsSelectable && (
                <Animated.View
                    entering={FadeInDown}
                    exiting={FadeOutDown}
                    style={[
                        styles.bottomBarContainer,
                        {paddingBottom: bottom},
                    ]}>
                    <TouchableOpacity
                        onPress={() => {
                            deleteSavedProducts(
                                selectedProducts.map(p => ({
                                    id: p.id,
                                    collectionId: null,
                                })),
                            );
                            toggleSelectable();
                        }}>
                        <Text style={[styles.bottomBarText, styles.removeText]}>
                            Remove
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            openModal(selectedProducts);
                        }}>
                        <Text
                            style={[
                                styles.bottomBarText,
                                styles.addToCollectionText,
                            ]}>
                            Add to Collection
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            <AddToCollectionBottomSheet />
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
    bottomBarContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: PALETTE.neutral[1],
        paddingHorizontal: 25,
        borderTopWidth: 1,
        borderColor: PALETTE.neutral[2],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bottomBarText: {
        paddingTop: 20,
        paddingBottom: 5,
        fontWeight: '500',
    },
    removeText: {
        color: DELETE_COLOR,
    },
    addToCollectionText: {
        fontWeight: '400',
    },
});

export default SavedHome;
