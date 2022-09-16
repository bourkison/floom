import React from 'react';
import ProductList from '@/components/Product/ProductList';
import {View, StyleSheet, Text} from 'react-native';
import ActionButton from '@/components/Utility/ActionButton';
import {useWindowDimensions} from 'react-native';

const IMAGE_RATIO = 0.9;
const IMAGE_PADDING = 40;

const Swipe = () => {
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
                <ActionButton type="save" radius={50} />
            </View>
            <View style={{flex: 1}}>
                <Text>TEST TEST</Text>
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
    },
});

export default Swipe;
