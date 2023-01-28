import React from 'react';
import ProductList from '@/components/Product/ProductList';
import FeaturedProduct from '@/components/Product/FeaturedProduct';
import {View, StyleSheet, useWindowDimensions} from 'react-native';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import {IMAGE_RATIO, IMAGE_PADDING, PALETTE} from '@/constants';
import FilterDropdown from '@/components/Product/FilterDropdown';

import ActionButton from '@/components/Utility/ActionButton';
import {useAppSelector} from '@/store/hooks';

const Home = ({}: StackScreenProps<MainStackParamList, 'Home'>) => {
    const {width} = useWindowDimensions();

    const isLoading = useAppSelector(state => state.product.unsaved.isLoading);
    const isLoadingMore = useAppSelector(
        state => state.product.unsaved.isLoadingMore,
    );
    const moreToLoad = useAppSelector(
        state => state.product.unsaved.moreToLoad,
    );
    const productsLength = useAppSelector(
        state => state.product.unsaved.products.length,
    );

    return (
        <View style={styles.flexOne}>
            <FilterDropdown obj="unsaved" />
            <View style={styles.container}>
                <View
                    style={[
                        styles.productContainer,
                        {flexBasis: (width - IMAGE_PADDING) / IMAGE_RATIO},
                    ]}>
                    <ProductList />
                </View>
                <View style={{width: '100%', marginTop: 10, zIndex: -1}}>
                    <FeaturedProduct />
                </View>

                {/* Don't render action buttons if no products found. */}
                <View
                    style={[
                        styles.buttonsContainer,
                        !isLoading &&
                        !isLoadingMore &&
                        !moreToLoad &&
                        !productsLength
                            ? styles.hidden
                            : undefined,
                    ]}>
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
        paddingTop: 10,
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
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
    },
    flexOne: {flex: 1},
    welcomeTextContainer: {
        marginTop: 10,
        zIndex: -1,
    },
    welcomeText: {
        fontSize: 12,
        color: PALETTE.neutral[3],
    },
    hidden: {
        opacity: 0,
    },
});

export default Home;
