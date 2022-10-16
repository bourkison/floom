import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import Product from '@/components/Product/Product';

import {LOAD_UNSAVED_PRODUCTS} from '@/store/slices/product';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {QueryProductInit} from '@/types/product';

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
        const loadProducts = async (initialLoad: boolean, startAt?: string) => {
            let init: QueryProductInit = {
                queryStringParameters: {
                    loadAmount: 10,
                    type: 'unsaved',
                },
            };

            if (startAt && init.queryStringParameters) {
                init.queryStringParameters.startAt = startAt;
            }

            dispatch(
                LOAD_UNSAVED_PRODUCTS({
                    queryStringParameters: init.queryStringParameters,
                    initialLoad,
                }),
            );
        };

        if (!products.length && !isLoading && moreToLoad) {
            loadProducts(true);
        } else if (
            products.length <= NUM_SHOWN_PRODUCTS + 1 &&
            !isLoading &&
            !isLoadingMore &&
            moreToLoad
        ) {
            loadProducts(false, products[products.length - 1]._id);
        }
    }, [products, isLoading, dispatch, isLoadingMore, moreToLoad]);

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
});

export default ProductList;
