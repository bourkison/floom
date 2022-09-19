import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Product as ProductType} from '@/types/product';

type SavedProductProps = {
    product: ProductType;
    index: number;
};

const SavedProduct: React.FC<SavedProductProps> = ({product, index}) => {
    return (
        <View
            style={[
                styles.container,
                index === 0
                    ? {borderTopColor: '#1a1f25', borderTopWidth: 1}
                    : undefined,
            ]}>
            <Text>{product.title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexBasis: 40,
        height: 64,
        borderBottomColor: '#1a1f25',
        borderBottomWidth: 1,
    },
});

export default SavedProduct;
