import React from 'react';
import ProductList from '@/components/Product/ProductList';
import {View, StyleSheet} from 'react-native';

const Swipe = () => {
    return (
        <View style={styles.container}>
            <ProductList />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
    },
});

export default Swipe;
