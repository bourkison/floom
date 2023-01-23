import React, {useCallback, useEffect, useState} from 'react';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';

import ProductListItem, {
    PRODUCT_LIST_ITEM_HEIGHT,
} from '@/components/Product/ProductListItem';
import {useAppSelector, useAppDispatch} from '@/store/hooks';
import {LOAD_SAVED_PRODUCTS} from '@/store/slices/product';
import {QueryProductInit} from '@/types/product';
import {FlashList} from '@shopify/flash-list';

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

    const loadMore = async () => {
        console.log('Load more');
        if (!isLoadingMore && !isLoading && !isRefreshing && moreToLoad) {
            loadProducts('more', savedProducts[savedProducts.length - 1]._id);
        }
    };

    return (
        <View style={styles.safeContainer}>
            {isLoading ? (
                <ActivityIndicator style={styles.activityIndicator} />
            ) : (
                <FlashList
                    data={savedProducts}
                    renderItem={({item, index}) => (
                        <ProductListItem
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
                            <ActivityIndicator
                                style={styles.activityIndicator}
                            />
                        ) : undefined
                    }
                    refreshControl={
                        <RefreshControl
                            onRefresh={refresh}
                            refreshing={isRefreshing}
                        />
                    }
                />
            )}
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
});

export default SavedProducts;
