import {queryProduct} from '@/api/product';
import React, {useEffect} from 'react';
import {Text, View} from 'react-native';

const DeletedProducts = () => {
    useEffect(() => {
        const initFetch = async () => {
            const products = await queryProduct({
                init: {
                    queryStringParameters: {loadAmount: 25, type: 'deleted'},
                },
            });

            console.log('DELETED PRODUCTS', products);
        };

        initFetch();
    });

    return (
        <View>
            <Text>Deleted Products</Text>
        </View>
    );
};

export default DeletedProducts;
