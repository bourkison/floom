import React, {useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native';

import Product from '@/components/Product/Product';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {PALETTE} from '@/constants';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {loadUnsavedProducts, clearFilters} from '@/store/slices/product';

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

    const gender = useAppSelector(
        state => state.user.userData?.gender || 'both',
    );

    const dispatch = useAppDispatch();

    useEffect(() => {
        const loadProducts = async () =>
            // loadType: 'initial' | 'refresh' | 'more',
            // startAt?: string,
            {
                await dispatch(loadUnsavedProducts());
            };

        // If no products, and more to load, and not already loading, AND we're not logging out (and resetting hence calling this useEffect again)
        // OR products is less than amount, more to load, and not already loading.
        if (!products.length && !isLoading && moreToLoad) {
            loadProducts();
        } else if (
            products.length <= NUM_SHOWN_PRODUCTS + 1 &&
            !isLoading &&
            !isLoadingMore &&
            moreToLoad
        ) {
            loadProducts();
        }
    }, [products, isLoading, dispatch, isLoadingMore, moreToLoad]);

    const retry = async (clear: boolean) => {
        if (clear) {
            dispatch(clearFilters({gender}));
        }

        await dispatch(loadUnsavedProducts());
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
                    key={product.id}>
                    <Product product={product} index={index} />
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        zIndex: -1,
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
