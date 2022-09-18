import React, {useEffect, useState} from 'react';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';
import {SafeAreaView, Text} from 'react-native';

import {Product as ProductType} from '@/types/product';
import {queryProduct} from '@/api/product';

const LikedProducts = ({
    navigation,
}: StackScreenProps<MainStackParamList, 'LikedProducts'>) => {
    const [savedProducts, setSavedProducts] = useState<ProductType[]>([]);

    useEffect(() => {
        const initLoad = async () => {
            setSavedProducts(
                await queryProduct({
                    init: {
                        queryStringParameters: {loadAmount: 10, type: 'saved'},
                    },
                }),
            );
        };

        initLoad();
    }, []);

    return (
        <SafeAreaView>
            <Text>Liked Products</Text>
        </SafeAreaView>
    );
};

export default LikedProducts;
