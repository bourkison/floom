import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, useWindowDimensions} from 'react-native';
import {Product as ProductType} from '@/types/Product';
import {faker} from '@faker-js/faker';
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

    const saveProduct = (): void => {
        dispatch(SET_PRODUCTS(products.slice(1, products.length)));
    };

    const loadProducts = (): void => {
        // GENERATE FAKE PRODUCT DATA.
        const FAKE_DATA_AMOUNT = 5;
        let temp: ProductType[] = [];

        for (let i = 0; i < FAKE_DATA_AMOUNT; i++) {
            temp.push({
                id: faker.datatype.uuid(),
                title: faker.vehicle.vehicle(),
                price: Math.floor(Math.random() * 100000) / 100,
                imageLink: [
                    faker.image.animals(400, Math.floor(400 / 0.9), true),
                    faker.image.animals(400, Math.floor(400 / 0.9), true),
                ],
                link: 'https://www.strenive.com',
            });
        }

        dispatch(SET_PRODUCTS(temp));
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
                                onSave={saveProduct}
                                animated={false}
                                key={products[1].id}
                            />
                        </View>
                    ) : undefined}
                    <View>
                        <Product
                            product={products[0]}
                            onSave={saveProduct}
                            animated={true}
                            key={products[0].id}
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
