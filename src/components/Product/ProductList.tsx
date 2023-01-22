import React, {useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native';
import Product from '@/components/Product/Product';

import {LOAD_UNSAVED_PRODUCTS, CLEAR_FILTERS} from '@/store/slices/product';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {QueryProductInit} from '@/types/product';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {PALETTE} from '@/constants';

const NUM_SHOWN_PRODUCTS = 5;

const ProductList = () => {
    const products = useAppSelector(state => state.product.unsaved.products);
    const isLoading = useAppSelector(state => state.product.unsaved.isLoading);
    const isLoadingMore = useAppSelector(
        state => state.product.unsaved.isLoadingMore,
    );
    const moreToLoad = useAppSelector(
        state => state.product.unsaved.moreToLoad,
    );

    const dispatch = useAppDispatch();

    useEffect(() => {
        const loadProducts = async (
            loadType: 'initial' | 'refresh' | 'more',
            startAt?: string,
        ) => {
            let queryStringParameters: QueryProductInit['queryStringParameters'] =
                {
                    loadAmount: 10,
                    type: 'unsaved',
                };

            if (startAt && queryStringParameters) {
                queryStringParameters.startAt = startAt;
            }

            await dispatch(
                LOAD_UNSAVED_PRODUCTS({
                    queryStringParameters,
                    loadType,
                    filtered: true,
                }),
            );
        };

        // If no products, and more to load, and not already loading
        // OR products is less than amount, more to load, and not already loading.
        if (!products.length && !isLoading && moreToLoad) {
            loadProducts('initial');
        } else if (
            products.length <= NUM_SHOWN_PRODUCTS + 1 &&
            !isLoading &&
            !isLoadingMore &&
            moreToLoad
        ) {
            loadProducts('more', products[products.length - 1]._id);
        }
    }, [products, isLoading, dispatch, isLoadingMore, moreToLoad]);

    const retry = async (clearFilters: boolean) => {
        if (clearFilters) {
            await dispatch(CLEAR_FILTERS());
        }

        let queryStringParameters: QueryProductInit['queryStringParameters'] = {
            loadAmount: 10,
            type: 'unsaved',
        };

        await dispatch(
            LOAD_UNSAVED_PRODUCTS({
                queryStringParameters,
                loadType: 'initial',
                filtered: true,
            }),
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!products.length && !isLoading && !moreToLoad) {
        return (
            <View style={styles.noProductsContainer}>
                <View style={styles.noProductsContainerVert}>
                    <View style={styles.noProductsTextContainer}>
                        <Text style={styles.noProductsText}>
                            No products found
                        </Text>
                    </View>
                    <View>
                        <AnimatedButton
                            onPress={() => {
                                retry(false);
                            }}
                            style={styles.retryButton}
                            textStyle={styles.retryButtonText}>
                            Retry
                        </AnimatedButton>
                        <AnimatedButton
                            onPress={() => {
                                retry(true);
                            }}
                            style={styles.clearRetryButton}
                            textStyle={styles.clearRetryButtonText}>
                            Clear Filters and Refresh
                        </AnimatedButton>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {products.slice(0, NUM_SHOWN_PRODUCTS).map((product, index) => (
                <View
                    style={{zIndex: 20 - index, elevation: 20 - index}}
                    key={product._id}>
                    <Product product={product} index={index} />
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noProductsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        flexDirection: 'row',
    },
    noProductsContainerVert: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noProductsTextContainer: {
        marginBottom: 5,
    },
    noProductsText: {
        color: PALETTE.neutral[5],
    },
    retryButton: {
        paddingVertical: 7,
        paddingHorizontal: 100,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    retryButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    clearRetryButton: {
        paddingVertical: 7,
        paddingHorizontal: 50,
        borderColor: PALETTE.neutral[8],
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
        marginTop: 3,
    },
    clearRetryButtonText: {
        color: PALETTE.neutral[8],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
});

export default ProductList;
