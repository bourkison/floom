import {queryProduct} from '@/api/product';
import {Product} from '@/types/product';
import React, {useEffect, useState} from 'react';
import {Text, View, ActivityIndicator} from 'react-native';

const DeletedProducts = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const initFetch = async () => {
            const {products: p} = await queryProduct({
                init: {
                    queryStringParameters: {loadAmount: 25, type: 'deleted'},
                },
            });

            setProducts(p);
            setIsLoading(false);
        };

        setIsLoading(true);
        initFetch();
    }, []);

    return (
        <View>
            {isLoading ? (
                <ActivityIndicator />
            ) : (
                products.map(p => <Text key={p._id}>{p.title}</Text>)
            )}
        </View>
    );
};

export default DeletedProducts;
