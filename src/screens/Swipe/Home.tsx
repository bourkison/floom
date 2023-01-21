import React from 'react';
import ProductList from '@/components/Product/ProductList';
import {View, StyleSheet, useWindowDimensions, Text} from 'react-native';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import {IMAGE_RATIO, IMAGE_PADDING, PALETTE} from '@/constants';
import FilterDropdown from '@/components/Product/FilterDropdown';

import ActionButton from '@/components/Utility/ActionButton';
import {useAppSelector} from '@/store/hooks';

const Home = ({}: StackScreenProps<MainStackParamList, 'Home'>) => {
    const isGuest = useAppSelector(state => state.user.isGuest);
    const user = useAppSelector(state => state.user.docData);
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
                <View style={styles.welcomeTextContainer}>
                    <Text style={styles.welcomeText}>
                        {!isGuest && user
                            ? `Logged in as ${user.email}`
                            : 'Guest Mode. Create account for more features.'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
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
    welcomeTextContainer: {
        marginTop: 10,
        zIndex: -1,
    },
    welcomeText: {
        fontSize: 12,
        color: PALETTE.neutral[3],
    },
});

export default Home;
