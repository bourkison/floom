import React, {useLayoutEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    RefreshControl,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeOutDown,
    Layout,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AddToCollectionBottomSheet from '@/components/Save/AddToCollectionSheet';
import SaveListItem from '@/components/Save/SaveListItem';
import SearchInput from '@/components/Utility/SearchInput';
import {DELETE_COLOR, PALETTE} from '@/constants';
import {useBottomSheetContext} from '@/context/BottomSheet';
import {useSharedSavedContext} from '@/context/saved';
import {
    INITIAL_SAVE_LOAD_AMOUNT,
    SUBSEQUENT_SAVE_LOAD_AMOUNT,
} from '@/screens/Saved/SavedHome';
import {Database} from '@/types/schema';

type SavedListProps = {
    savesSelectable: boolean;
    setSavesSelectable: (s: boolean) => void;
    animationsEnabled: boolean;
    setAnimationsEnabled: (enabled: boolean) => void;
};

const SavedList = ({
    savesSelectable,
    setSavesSelectable,
    animationsEnabled,
    setAnimationsEnabled,
}: SavedListProps) => {
    const [searchText, setSearchText] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<
        Database['public']['Views']['v_saves']['Row'][]
    >([]);

    useLayoutEffect(() => {
        setAnimationsEnabled(true);
    }, [setAnimationsEnabled]);

    const {fetchSaves, saves, loadingSavesState, deleteSavedProducts} =
        useSharedSavedContext();
    const {openBottomSheet, closeBottomSheet} = useBottomSheetContext();
    const {bottom} = useSafeAreaInsets();

    const filteredSaves = useMemo(() => {
        return saves.filter(save => save.name.includes(searchText));
    }, [saves, searchText]);

    const toggleSelectable = () => {
        if (savesSelectable) {
            setSavesSelectable(false);
            setSelectedProducts([]);

            return;
        }

        setSavesSelectable(true);
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

    const refresh = async () => {
        fetchSaves(INITIAL_SAVE_LOAD_AMOUNT, 'refresh');
    };

    return (
        <View style={styles.scrollContainer}>
            {loadingSavesState !== 'load' ? (
                <Animated.FlatList
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="never"
                    itemLayoutAnimation={
                        animationsEnabled ? Layout.duration(300) : undefined
                    }
                    refreshControl={
                        <RefreshControl
                            onRefresh={refresh}
                            refreshing={loadingSavesState === 'refresh'}
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
                    refreshing={loadingSavesState === 'refresh'}
                    data={filteredSaves}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({item}) => (
                        <SaveListItem
                            animationsEnabled={animationsEnabled}
                            selectable={savesSelectable}
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

            {savesSelectable && (
                <Animated.View
                    entering={animationsEnabled ? FadeInDown : undefined}
                    exiting={animationsEnabled ? FadeOutDown : undefined}
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
                            openBottomSheet(
                                <AddToCollectionBottomSheet
                                    onSelect={() => {
                                        toggleSelectable();
                                        closeBottomSheet();
                                    }}
                                    selectedSaves={selectedProducts}
                                />,
                                0.6,
                            );
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
        </View>
    );
};

const styles = StyleSheet.create({
    addToCollectionText: {
        fontWeight: '400',
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
    loadingMoreIndicator: {
        marginTop: 10,
    },
    searchContainer: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        width: '100%',
        backgroundColor: '#FFF',
        borderColor: PALETTE.neutral[2],
        borderBottomWidth: 1,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
    searchBox: {
        paddingVertical: 2,
    },
});

export default SavedList;
