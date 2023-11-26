import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';

import FeaturedProduct from '@/components/Product/FeaturedProduct';
import ProductList from '@/components/Product/ProductList';
import SortFilter, {FILTERS_HEIGHT} from '@/components/Product/SortFilter';
import ActionButton from '@/components/Utility/ActionButton';
import {
    IMAGE_RATIO,
    IMAGE_PADDING,
    PALETTE,
    ACTION_BUTTON_SIZE,
    FEATURED_PRODUCT_SIZE,
} from '@/constants';
import {HEADER_HEIGHT_W_STATUS_BAR} from '@/nav/Headers';
import {MainStackParamList} from '@/nav/Navigator';
import {useAppSelector} from '@/store/hooks';

const Home = (_: StackScreenProps<MainStackParamList, 'Home'>) => {
    const {width, height} = useWindowDimensions();

    const isLoading = useAppSelector(state => state.product.unsaved.isLoading);
    const moreToLoad = useAppSelector(
        state => state.product.unsaved.moreToLoad,
    );
    const productsLength = useAppSelector(
        state => state.product.unsaved.products.length,
    );

    const topProduct = useAppSelector(
        state => state.product.unsaved.products[0],
    );

    // Calculate margins for different device heights.
    const calculateMargins = useCallback((): number => {
        const headerHeight = HEADER_HEIGHT_W_STATUS_BAR;
        const searchBarHeight = FILTERS_HEIGHT;
        const productListHeight = (width - IMAGE_PADDING) / IMAGE_RATIO;
        const actionButtonHeight = ACTION_BUTTON_SIZE;
        const featuredProductHeight = FEATURED_PRODUCT_SIZE;

        const remainingHeight =
            height -
            headerHeight -
            searchBarHeight -
            productListHeight -
            actionButtonHeight -
            featuredProductHeight;

        return remainingHeight / 5;
    }, [height, width]);

    const actionButtonDisabled = useMemo((): boolean => {
        if (!productsLength && !moreToLoad && !isLoading) {
            return true;
        }

        return false;
    }, [moreToLoad, productsLength, isLoading]);

    return (
        <View style={styles.flexOne}>
            <SortFilter obj="unsaved" />
            <View style={[styles.container, {marginTop: calculateMargins()}]}>
                <View
                    style={[
                        styles.productContainer,
                        {flexBasis: (width - IMAGE_PADDING) / IMAGE_RATIO},
                    ]}>
                    <ProductList />
                </View>
                <View
                    style={[
                        styles.featuredProductContainer,
                        {marginTop: calculateMargins()},
                    ]}>
                    <FeaturedProduct />
                </View>

                <View
                    style={[
                        styles.buttonsContainer,
                        {marginTop: calculateMargins()},
                    ]}>
                    <ActionButton
                        type="delete"
                        product={topProduct}
                        disabled={actionButtonDisabled}
                    />
                    <ActionButton
                        type="buy"
                        product={topProduct}
                        disabled={actionButtonDisabled}
                    />
                    <ActionButton
                        type="save"
                        product={topProduct}
                        disabled={actionButtonDisabled}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        alignContent: 'center',
        zIndex: -1,
        elevation: -1,
    },
    productContainer: {
        flex: 1,
        flexGrow: 0,
        flexShrink: 0,
        zIndex: 2,
        elevation: 2,
    },
    buttonsContainer: {
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
    featuredProductContainer: {
        width: '100%',
        marginTop: 10,
        zIndex: -1,
        elevation: -1,
    },
});

export default Home;
