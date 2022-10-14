import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {queryProduct} from '@/api/product';
import Product from '@/components/Product/Product';

import {PUSH_PRODUCTS} from '@/store/slices/product';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {QueryProductInit} from '@/types/product';

const NUM_SHOWN_PRODUCTS = 5;

const ProductList = () => {
    const products = useAppSelector(state => state.product.products);
    const dispatch = useAppDispatch();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadProducts = async (startAt?: string) => {
            setIsLoading(true);
            let init: QueryProductInit = {
                queryStringParameters: {
                    loadAmount: 10,
                    type: 'unsaved',
                },
            };

            if (startAt && init.queryStringParameters) {
                init.queryStringParameters.startAt = startAt;
            }

            const {products: p} = await queryProduct({
                init,
            });
            dispatch(PUSH_PRODUCTS(p));
            setIsLoading(false);
        };

        if (!products.length && !isLoading) {
            loadProducts();
        } else if (products.length <= NUM_SHOWN_PRODUCTS + 1 && !isLoading) {
            loadProducts(products[products.length - 1]._id);
        }
    }, [products, isLoading, dispatch]);

    return (
        <View style={styles.container}>
            {products.slice(0, NUM_SHOWN_PRODUCTS).map((product, index) => (
                <View style={{zIndex: 20 - index}} key={product._id}>
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
