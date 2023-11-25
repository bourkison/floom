import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
    Modal,
    Pressable,
    Text,
    useWindowDimensions,
} from 'react-native';

import FilterDropdown, {
    FILTER_DROPDOWN_CLOSED_HEIGHT,
} from '@/components/Product/FilterDropdown';
import ProductListItem, {
    PRODUCT_LIST_ITEM_HEIGHT,
} from '@/components/Product/ProductListItem';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import SectionHeader from '@/components/Utility/SectionHeader';
import {PALETTE} from '@/constants';
import {HEADER_HEIGHT_W_STATUS_BAR} from '@/nav/Headers';
import {filtersApplied} from '@/services';
import {useAppSelector, useAppDispatch} from '@/store/hooks';
import {
    clearFilters,
    deleteAllDeletedProducts,
    deleteDeletedProduct,
    loadDeletedProducts,
} from '@/store/slices/product';
import {Database} from '@/types/schema';

const INITIAL_LOAD_AMOUNT = 10;
// const SUBSEQUENT_LOAD_AMOUNT = 10;
const ON_END_REACHED_THRESHOLD = 1;

const DeletedProducts = () => {
    const [loadAttempted, setLoadAttempted] = useState(false);

    const isLoading = useAppSelector(state => state.product.deleted.isLoading);
    const products = useAppSelector(state => state.product.deleted.products);
    const moreToLoad = useAppSelector(
        state => state.product.deleted.moreToLoad,
    );
    const isLoadingMore = useAppSelector(
        state => state.product.deleted.isLoadingMore,
    );
    const filters = useAppSelector(state => state.product.deleted.filters);
    const gender = useAppSelector(
        state => state.user.userData?.gender || 'both',
    );

    const [isRefreshing, setIsRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const {height} = useWindowDimensions();

    const ListRef =
        useRef<FlashList<Database['public']['Views']['v_products']['Row']>>(
            null,
        );

    const dispatch = useAppDispatch();

    useEffect(() => {
        const initFetch = async () => {
            await dispatch(loadDeletedProducts());
        };

        if (
            products.length < INITIAL_LOAD_AMOUNT &&
            !isLoading &&
            !loadAttempted
        ) {
            setLoadAttempted(true);
            initFetch();
        } else if (!loadAttempted) {
            setLoadAttempted(true);
        }
    }, [products, isLoading, loadAttempted, dispatch]);

    const refresh = async () => {
        setIsRefreshing(true);
        await dispatch(loadDeletedProducts());
        setIsRefreshing(false);
    };

    const retry = useCallback(
        async (cFilters: boolean) => {
            await dispatch(loadDeletedProducts());

            if (cFilters) {
                dispatch(clearFilters({filterType: 'deleted', gender}));
            }
        },
        [dispatch, gender],
    );

    const loadMore = async () => {
        if (moreToLoad) {
            dispatch(loadDeletedProducts());
        }
    };

    const removeProduct = (
        product: Database['public']['Views']['v_products']['Row'],
    ) => {
        dispatch(deleteDeletedProduct(product.id));
    };

    const deleteAllProducts = async () => {
        setIsDeletingAll(!isDeletingAll);
        await dispatch(deleteAllDeletedProducts());
        setIsDeletingAll(false);
        setModalVisible(false);
    };

    const isEmpty = useCallback(() => {
        if (!isLoading && !products.length && !moreToLoad) {
            return true;
        }

        return false;
    }, [isLoading, products, moreToLoad]);

    const EmptyComponent = useMemo(() => {
        if (isLoading) {
            return (
                <View style={styles.loadingIndicator}>
                    <ActivityIndicator />
                </View>
            );
        }

        if (isEmpty()) {
            const remainingHeight =
                height -
                HEADER_HEIGHT_W_STATUS_BAR -
                FILTER_DROPDOWN_CLOSED_HEIGHT;

            const hasFilters = filtersApplied(filters);

            return (
                <View
                    style={[styles.emptyContainer, {height: remainingHeight}]}>
                    <Text style={styles.noProductsText}>
                        {hasFilters
                            ? 'No products found. Clear filters, or retry.'
                            : 'No deleted products. Get swiping, or try again.'}
                    </Text>
                    <View style={styles.refreshButtonContainer}>
                        <AnimatedButton
                            style={styles.refreshButton}
                            textStyle={styles.refreshButtonText}
                            onPress={() => retry(false)}>
                            Refresh
                        </AnimatedButton>
                        {hasFilters ? (
                            <AnimatedButton
                                onPress={() => retry(true)}
                                style={styles.clearFiltersRefreshButton}
                                textStyle={
                                    styles.clearFiltersRefreshButtonText
                                }>
                                Clear Filters and Refresh
                            </AnimatedButton>
                        ) : undefined}
                    </View>
                </View>
            );
        }

        return <View />;
    }, [isLoading, filters, height, isEmpty, retry]);

    return (
        <View style={styles.container}>
            <FilterDropdown obj="deleted" />
            <FlashList
                ref={ListRef}
                data={products}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={EmptyComponent}
                renderItem={({item, index}) => (
                    <ProductListItem
                        product={item}
                        index={index}
                        type="deleted"
                        onDelete={removeProduct}
                        listRef={ListRef}
                    />
                )}
                onEndReached={() => {
                    if (moreToLoad && !isLoadingMore) {
                        loadMore();
                    }
                }}
                estimatedItemSize={PRODUCT_LIST_ITEM_HEIGHT}
                ListHeaderComponent={
                    !isEmpty() && !isLoading ? (
                        <View style={styles.resetAllButtonContainer}>
                            <AnimatedButton
                                onPress={() => {
                                    setModalVisible(true);
                                }}
                                style={styles.resetAllButton}
                                textStyle={styles.resetAllButtonText}>
                                Reset All
                            </AnimatedButton>
                        </View>
                    ) : undefined
                }
                ListFooterComponent={
                    isLoadingMore ? (
                        <ActivityIndicator style={styles.activityIndicator} />
                    ) : undefined
                }
                refreshControl={
                    !isLoading ? (
                        <RefreshControl
                            onRefresh={refresh}
                            refreshing={isRefreshing}
                        />
                    ) : undefined
                }
                onEndReachedThreshold={ON_END_REACHED_THRESHOLD}
            />
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade">
                <Pressable
                    style={styles.modalPressable}
                    onPress={() => setModalVisible(false)}>
                    <Pressable style={styles.modalContainer}>
                        <View>
                            <SectionHeader>Reset Products</SectionHeader>
                            <Text style={styles.modalText}>
                                Are you sure you want to reset all deleted
                                products? This will reset all products you have
                                already seen, allowing them to show up on the
                                homepage again.
                            </Text>
                            <Text
                                style={[
                                    styles.modalText,
                                    styles.unsetMarginTop,
                                ]}>
                                This cannot be undone.
                            </Text>
                        </View>
                        <View style={styles.buttonsContainer}>
                            <View style={styles.buttonContainer}>
                                <AnimatedButton
                                    style={styles.cancelButton}
                                    textStyle={styles.cancelButtonText}
                                    onPress={() => {
                                        setModalVisible(false);
                                    }}>
                                    Go Back
                                </AnimatedButton>
                            </View>
                            <View style={styles.buttonContainer}>
                                <AnimatedButton
                                    style={styles.deleteButton}
                                    textStyle={styles.deleteButtonText}
                                    onPress={deleteAllProducts}
                                    disabled={isDeletingAll}>
                                    {isDeletingAll ? (
                                        <ActivityIndicator />
                                    ) : (
                                        'Reset'
                                    )}
                                </AnimatedButton>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    deletedProductContainer: {
        flex: 1,
    },
    resetAllButtonContainer: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 25,
    },
    resetAllButton: {
        flex: 1,
        backgroundColor: PALETTE.red[7],
        borderRadius: 5,
        paddingVertical: 8,
    },
    resetAllButtonText: {
        color: '#f3fcfa',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalPressable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        width: '100%',
        padding: 10,
        borderRadius: 5,
        shadowColor: PALETTE.neutral[6],
        shadowOpacity: 0.6,
    },
    modalText: {
        color: PALETTE.neutral[6],
        fontSize: 12,
        marginVertical: 5,
        paddingHorizontal: 15,
    },
    buttonsContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    buttonContainer: {
        flex: 1,
        padding: 5,
    },
    cancelButton: {
        padding: 7,
        borderColor: PALETTE.neutral[8],
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        color: PALETTE.neutral[8],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    deleteButton: {
        padding: 7,
        backgroundColor: PALETTE.red[7],
        borderColor: PALETTE.red[7],
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        width: '100%',
        alignSelf: 'center',
    },
    deleteButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    activityIndicator: {
        marginTop: 5,
    },
    unsetMarginTop: {
        marginTop: 0,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    refreshButtonContainer: {
        paddingHorizontal: 10,
        width: '75%',
        marginTop: 5,
    },
    refreshButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    refreshButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    clearFiltersRefreshButton: {
        padding: 7,
        borderColor: PALETTE.neutral[8],
        backgroundColor: 'transparent',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
        marginTop: 5,
    },
    clearFiltersRefreshButtonText: {
        color: PALETTE.neutral[8],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    noProductsText: {
        color: PALETTE.neutral[4],
        fontSize: 12,
        paddingHorizontal: 5,
        paddingVertical: 3,
    },
    loadingIndicator: {marginTop: 25},
});

export default DeletedProducts;
