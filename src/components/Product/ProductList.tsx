import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Product as ProductType} from '@/types/Product';
import {faker} from '@faker-js/faker';
import Product from '@/components/Product/Product';

const ProductList = () => {
    const [products, setProducts] = useState<ProductType[]>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const saveProduct = (): void => {
        setProducts(products.slice(1, products.length));
    };

    useEffect(() => {
        console.log('PRODUCTS CHANGED:', products.length, products);
    }, [products]);

    const loadProducts = (): void => {
        // GENERATE FAKE PRODUCT DATA.
        const FAKE_DATA_AMOUNT = 5;
        let temp: ProductType[] = [];

        for (let i = 0; i < FAKE_DATA_AMOUNT; i++) {
            temp.push({
                id: faker.datatype.uuid(),
                title: faker.vehicle.vehicle(),
                price: Math.floor(Math.random() * 100000) / 100,
                imageLink: [faker.image.animals(300, 300, true)],
                link: 'https://www.strenive.com',
            });
        }

        setProducts(temp);
    };

    return (
        <View style={styles.container}>
            {/* Slice array so that we don't mutate with reverse() */}
            {products
                .slice()
                .reverse()
                .map(product => (
                    <Product
                        key={product.id}
                        product={product}
                        onSave={saveProduct}
                    />
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
});

export default ProductList;
