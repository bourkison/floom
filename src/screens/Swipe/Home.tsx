import React from 'react';
import ProductList from '@/components/Product/ProductList';
import {View, StyleSheet, useWindowDimensions} from 'react-native';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import {IMAGE_RATIO, IMAGE_PADDING} from '@/constants';
import FilterDropdown from '@/components/Product/FilterDropdown';

import ActionButton from '@/components/Utility/ActionButton';

const Home = ({}: StackScreenProps<MainStackParamList, 'Home'>) => {
    const {width} = useWindowDimensions();

    return (
        <View style={styles.flexOne}>
            <FilterDropdown />
            <View style={styles.container}>
                <View
                    style={[
                        styles.productContainer,
                        {flexBasis: (width - IMAGE_PADDING) / IMAGE_RATIO},
                    ]}>
                    <ProductList />
                </View>
                <View style={styles.buttonsContainer}>
                    <ActionButton type="delete" />
                    <ActionButton type="buy" />
                    <ActionButton type="save" />
                </View>
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
        zIndex: 1,
    },
    productContainer: {
        flex: 1,
        flexGrow: 0,
        flexShrink: 0,
    },
    buttonsContainer: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: -1,
    },
    flexOne: {flex: 1},
});

export default Home;
