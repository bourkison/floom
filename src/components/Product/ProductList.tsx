import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, useWindowDimensions} from 'react-native';
import {Product as ProductType} from '@/types/product';
import {queryProduct} from '@/api/product';
import Product from '@/components/Product/Product';

import {SET_PRODUCTS} from '@/store/slices/product';
import {useAppDispatch, useAppSelector} from '@/store/hooks';

type ProductListProps = {};

const ProductList: React.FC<ProductListProps> = () => {
    const products = useAppSelector(state => state.product.products);
    const dispatch = useAppDispatch();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        console.log('Loading products');
        const products = await queryProduct({
            init: {queryStringParameters: {loadAmount: 10}},
        });
        console.log('PRODUCTS:', products);
        dispatch(SET_PRODUCTS(products));
    };

    return (
        <View style={styles.container}>
            {/* Slice array so that we don't mutate with reverse() */}
            {products.length > 0 ? (
                <View>
                    {products.length > 1 ? (
                        <View>
                            <Product
                                product={products[1]}
                                animated={false}
                                key={products[1]._id}
                            />
                        </View>
                    ) : undefined}
                    <View>
                        <Product
                            product={products[0]}
                            animated={true}
                            key={products[0]._id}
                        />
                    </View>
                </View>
            ) : undefined}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ProductList;
