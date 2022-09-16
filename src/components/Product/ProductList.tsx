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

    const loadProducts = () => {
        // GENERATE FAKE PRODUCT DATA.
        const FAKE_DATA_AMOUNT = 1;
        setProducts([]);
        for (let i = 0; i < FAKE_DATA_AMOUNT; i++) {
            setProducts(current => [
                ...current,
                {
                    id: faker.datatype.uuid(),
                    title: faker.vehicle.vehicle(),
                    price: Math.floor(Math.random() * 1000),
                    imageLink: [faker.image.animals(500, 400)],
                    link: 'https://www.strenive.com',
                },
            ]);
        }
    };

    return (
        <View style={styles.container}>
            {products.map(product => (
                <Product key={product.id} product={product} />
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
