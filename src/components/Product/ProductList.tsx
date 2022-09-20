import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {queryProduct} from '@/api/product';
import Product from '@/components/Product/Product';

import {SET_PRODUCTS} from '@/store/slices/product';
import {useAppDispatch, useAppSelector} from '@/store/hooks';

const NUM_SHOWN_PRODUCTS = 5;

const ProductList = () => {
    const products = useAppSelector(state => state.product.products);
    const dispatch = useAppDispatch();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const products = await queryProduct('unsaved', {
            init: {queryStringParameters: {loadAmount: 10, type: 'unsaved'}},
        });
        dispatch(SET_PRODUCTS(products));
    };

    return (
        <View style={styles.container}>
            {/* Slice array so that we don't mutate with reverse() */}
            {products
                .slice()
                .reverse()
                .slice(0, NUM_SHOWN_PRODUCTS)
                .map((product, index) => (
                    <View style={{zIndex: 100 - index}} key={product._id}>
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
