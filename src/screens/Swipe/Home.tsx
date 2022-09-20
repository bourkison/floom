import React from 'react';
import ProductList from '@/components/Product/ProductList';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import ActionButton from '@/components/Utility/ActionButton';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import AnimatedButton from '@/components/Utility/AnimatedButton';

const IMAGE_RATIO = 0.9;
const IMAGE_PADDING = 40;

const Home = ({navigation}: StackScreenProps<MainStackParamList, 'Home'>) => {
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
                <ActionButton
                    type="delete"
                    radius={50}
                    style={{marginHorizontal: 10}}
                />
                <ActionButton
                    type="buy"
                    radius={50}
                    style={{marginHorizontal: 10}}
                />
                <ActionButton
                    type="save"
                    radius={50}
                    style={{marginHorizontal: 10}}
                />
            </View>
            <View>
                <AnimatedButton
                    style={styles.profileButton}
                    textStyle={styles.profileButtonText}
                    onPress={() => {
                        navigation.push('Options');
                    }}>
                    Options
                </AnimatedButton>
            </View>
            <View>
                <AnimatedButton
                    style={styles.profileButton}
                    textStyle={styles.profileButtonText}
                    onPress={() => {
                        navigation.push('LikedProducts');
                    }}>
                    Liked Products
                </AnimatedButton>
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
    profileButton: {
        padding: 15,
        backgroundColor: '#1a1f25',
        justifyContent: 'center',
        borderRadius: 25,
        flexGrow: 0,
        flexShrink: 0,
        marginTop: 25,
        alignSelf: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    profileButtonText: {
        color: '#f3fcfa',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
});

export default Home;
