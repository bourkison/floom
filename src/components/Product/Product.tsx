import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Product as ProductType} from '@/types/Product';
import {useWindowDimensions} from 'react-native';

type ProductComponentProps = {
    product: ProductType;
};

const Product: React.FC<ProductComponentProps> = ({product}) => {
    const {width} = useWindowDimensions();
    const height = (640 / 480) * width;

    return (
        <View style={styles.container}>
            <Image style={styles.image} source={{uri: product.imageLink[0]}} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: 1,
            width: 1,
        },
        shadowOpacity: 0.2,
    },
    image: {
        width: 300,
        height: 300,
    },
});

export default Product;
