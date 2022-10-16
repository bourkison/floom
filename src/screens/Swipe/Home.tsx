import React from 'react';
import ProductList from '@/components/Product/ProductList';
import {View, StyleSheet, useWindowDimensions} from 'react-native';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import {
    IMAGE_RATIO,
    IMAGE_PADDING,
    DELETE_COLOR,
    BUY_COLOR,
    SAVE_COLOR,
} from '@/constants';
import FilterDropdown from '@/components/Product/FilterDropdown';
import AnimatedButton from '@/components/Utility/AnimatedButton';

import {Feather, AntDesign, Ionicons} from '@expo/vector-icons';
import {useAppDispatch} from '@/store/hooks';
import {COMMENCE_ANIMATE} from '@/store/slices/product';

const ACTION_BUTTON_SIZE = 50;

const Home = ({}: StackScreenProps<MainStackParamList, 'Home'>) => {
    const {width} = useWindowDimensions();
    const dispatch = useAppDispatch();

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
                    <AnimatedButton
                        style={styles.actionButton}
                        onPress={() => {
                            dispatch(COMMENCE_ANIMATE('delete'));
                        }}>
                        <View style={styles.button}>
                            <Feather
                                name="x"
                                size={ACTION_BUTTON_SIZE / 2}
                                color={DELETE_COLOR}
                            />
                        </View>
                    </AnimatedButton>
                    <AnimatedButton
                        style={styles.actionButton}
                        onPress={() => {
                            dispatch(COMMENCE_ANIMATE('buy'));
                        }}>
                        <View style={styles.button}>
                            <AntDesign
                                name="shoppingcart"
                                size={ACTION_BUTTON_SIZE / 2}
                                color={BUY_COLOR}
                            />
                        </View>
                    </AnimatedButton>
                    <AnimatedButton
                        style={styles.actionButton}
                        onPress={() => {
                            dispatch(COMMENCE_ANIMATE('save'));
                        }}>
                        <View style={styles.button}>
                            <Ionicons
                                name="heart"
                                size={ACTION_BUTTON_SIZE / 2}
                                color={SAVE_COLOR}
                            />
                        </View>
                    </AnimatedButton>
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
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: 1,
            width: 1,
        },
        shadowOpacity: 0.2,
        backgroundColor: '#f3fcf0',
        zIndex: 1,
        borderRadius: ACTION_BUTTON_SIZE / 2,
        width: ACTION_BUTTON_SIZE,
        height: ACTION_BUTTON_SIZE,
        marginHorizontal: 8,
    },
    flexOne: {flex: 1},
});

export default Home;
