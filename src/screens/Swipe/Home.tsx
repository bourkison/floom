import React from 'react';
import ProductList from '@/components/Product/ProductList';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import ActionButton from '@/components/Utility/ActionButton';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import {IMAGE_RATIO, IMAGE_PADDING} from '@/constants';

const Home = ({}: StackScreenProps<MainStackParamList, 'Home'>) => {
    const {width} = useWindowDimensions();

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.productContainer,
                    {flexBasis: (width - IMAGE_PADDING) / IMAGE_RATIO},
                ]}>
                <ProductList />
            </View>
            <View style={styles.buttonsContainer}>
                <ActionButton type="delete" radius={50} style={styles.button} />
                <ActionButton type="buy" radius={50} style={styles.button} />
                <ActionButton type="save" radius={50} style={styles.button} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        flex: 1,
        alignItems: 'center',
        alignContent: 'center',
    },
    productContainer: {
        flex: 1,
        flexGrow: 0,
        flexShrink: 0,
    },
    buttonsContainer: {
        marginTop: 40,
        flexDirection: 'row',
    },
    button: {
        marginHorizontal: 10,
    },
});

export default Home;
