import React, {useCallback, useEffect, useRef, useState} from 'react';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Text,
    useWindowDimensions,
} from 'react-native';

import ProductListItem, {
    PRODUCT_LIST_ITEM_HEIGHT,
} from '@/components/Product/ProductListItem';
import {useAppSelector, useAppDispatch} from '@/store/hooks';
import {LOAD_SAVED_PRODUCTS, CLEAR_FILTERS} from '@/store/slices/product';
import {Product, QueryProductInit} from '@/types/product';
import {FlashList} from '@shopify/flash-list';
import FilterDropdown, {
    FILTER_DROPDOWN_CLOSED_HEIGHT,
} from '@/components/Product/FilterDropdown';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {PALETTE} from '@/constants';
import {HEADER_HEIGHT_W_STATUS_BAR} from '@/nav/Headers';
import {filtersApplied} from '@/services';

const ON_END_REACHED_THRESHOLD = 1;

const SavedProducts = ({}: StackScreenProps<
    MainStackParamList,
    'SavedProducts'
>) => {
    const [isRefreshing, setIsRefereshing] = useState(false);

    const dispatch = useAppDispatch();
    const savedProducts = useAppSelector(state => state.product.saved.products);
    const moreToLoad = useAppSelector(state => state.product.saved.moreToLoad);
    const isLoading = useAppSelector(state => state.product.saved.isLoading);

    const isLoadingMore = useAppSelector(
        state => state.product.saved.isLoadingMore,
    );
    const filters = useAppSelector(state => state.product.saved.filters);

    const {height} = useWindowDimensions();

    const ListRef = useRef<FlashList<Product>>(null);

    const loadProducts = useCallback(
        async (loadType: 'initial' | 'refresh' | 'more', startAt?: string) => {
            let init: QueryProductInit = {
                queryStringParameters: {
                    loadAmount: 25,
                    type: 'saved',
                    reversed: true,
                },
            };

            if (startAt && init.queryStringParameters) {
                init.queryStringParameters.startAt = startAt;
            }

            await dispatch(
                LOAD_SAVED_PRODUCTS({
                    queryStringParameters: init.queryStringParameters,
                    loadType,
                    filtered: true,
                }),
            );
        },
        [dispatch],
    );

    useEffect(() => {
        // Call on initial load.
        if (!savedProducts.length && moreToLoad && !isLoading) {
            loadProducts('initial');
        }
    }, [loadProducts, savedProducts, moreToLoad, isLoading]);

    const refresh = async () => {
        setIsRefereshing(true);
        await loadProducts('refresh');
        setIsRefereshing(false);
    };

    const retry = async (clearFilters: boolean) => {
        await dispatch(
            LOAD_SAVED_PRODUCTS({
                queryStringParameters: {
                    loadAmount: 25,
                    type: 'saved',
                    reversed: true,
                },
                loadType: 'initial',
                filtered: !clearFilters,
            }),
        );

        if (clearFilters) {
            dispatch(CLEAR_FILTERS({obj: 'saved'}));
        }
    };

    const loadMore = async () => {
        if (!isLoadingMore && !isLoading && !isRefreshing && moreToLoad) {
            loadProducts('more', savedProducts[savedProducts.length - 1]._id);
        }
    };

    const isEmpty = useCallback(() => {
        if (!isLoading && !savedProducts.length && !moreToLoad) {
            return true;
        }

        return false;
    }, [isLoading, savedProducts, moreToLoad]);

    const EmptyComponent = () => {
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
                            : 'No saved products. Get swiping, or retry.'}
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
    };

    return (
        <View style={styles.safeContainer}>
            <FilterDropdown obj="saved" />
            <FlashList
                ref={ListRef}
                data={savedProducts}
                ListEmptyComponent={EmptyComponent}
                renderItem={({item, index}) => (
                    <ProductListItem
                        listRef={ListRef}
                        product={item}
                        index={index}
                        type="saved"
                    />
                )}
                keyExtractor={item => item._id}
                onEndReached={() => {
                    if (moreToLoad && !isLoadingMore) {
                        loadMore();
                    }
                }}
                estimatedItemSize={PRODUCT_LIST_ITEM_HEIGHT}
                removeClippedSubviews={true}
                onEndReachedThreshold={ON_END_REACHED_THRESHOLD}
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
            />
        </View>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
    },
    contentContainer: {
        backgroundColor: 'violet',
        flex: 1,
    },
    container: {
        flexDirection: 'column',
        background: 'violet',
    },
    activityIndicator: {
        marginTop: 5,
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

export default SavedProducts;
