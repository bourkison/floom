import React from 'react';
import ProductList from '@/components/Product/ProductList';
import FeaturedProduct from '@/components/Product/FeaturedProduct';
import {View, StyleSheet, useWindowDimensions} from 'react-native';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import {
    IMAGE_RATIO,
    IMAGE_PADDING,
    PALETTE,
    ACTION_BUTTON_SIZE,
    FEATURED_PRODUCT_SIZE,
} from '@/constants';
import FilterDropdown, {
    FILTER_DROPDOWN_CLOSED_HEIGHT,
} from '@/components/Product/FilterDropdown';

import ActionButton from '@/components/Utility/ActionButton';
import {useAppSelector} from '@/store/hooks';
import {HEADER_HEIGHT_W_STATUS_BAR} from '@/nav/Headers';

const Home = ({}: StackScreenProps<MainStackParamList, 'Home'>) => {
    const {width, height} = useWindowDimensions();

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

    // Calculate margins for different device heights.
    const calculateMargins = (): number => {
        const headerHeight = HEADER_HEIGHT_W_STATUS_BAR;
        const searchBarHeight = FILTER_DROPDOWN_CLOSED_HEIGHT;
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
    };

    return (
        <View style={styles.flexOne}>
            <FilterDropdown obj="unsaved" />
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
                        {marginTop: calculateMargins()},
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
