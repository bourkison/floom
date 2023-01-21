import React, {useState, useEffect} from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Text,
} from 'react-native';

import {Product} from '@/types/product';
import {queryProduct} from '@/api/product';
import {Feather} from '@expo/vector-icons';

import {useNavigation} from '@react-navigation/native';
import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {StackNavigationProp} from '@react-navigation/stack';

const NUM_PRODUCTS = 5;
const MARGIN_HORIZONTAL = 10;

const DeletedProductsWidget = () => {
    const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [imageSize, setImageSize] = useState({width: 0, height: 0});

    const navigation =
        useNavigation<StackNavigationProp<OptionsStackParamList>>();

    useEffect(() => {
        const initFetch = async () => {
            const {products} = await queryProduct({
                init: {queryStringParameters: {loadAmount: 5, type: 'deleted'}},
            });

            setDeletedProducts(products);
            setIsLoading(false);
        };

        setIsLoading(true);
        initFetch();
    }, []);

    return (
        <View
            style={styles.container}
            onLayout={({
                nativeEvent: {
                    layout: {width},
                },
            }) => {
                const n = (width - MARGIN_HORIZONTAL) / NUM_PRODUCTS;
                setImageSize({width: n, height: n});
            }}>
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate('DeletedProducts');
                }}
                activeOpacity={0.5}>
                {isLoading ? (
                    <ActivityIndicator />
                ) : (
                    <View style={styles.imageContainer}>
                        {deletedProducts.map(product => (
                            <Image
                                key={product._id}
                                style={imageSize}
                                source={{uri: product.images[0]}}
                            />
                        ))}
                    </View>
                )}
                <View style={styles.optionLink}>
                    <View style={styles.optionTextContainer}>
                        <Text>View All</Text>
                    </View>
                    <View style={styles.optionIconContainer}>
                        <Feather name="chevron-right" size={18} />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1},
    imageContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        marginTop: 10,
    },
    optionLink: {
        flexDirection: 'row',
        marginTop: 10,
        paddingHorizontal: 25,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionIconContainer: {
        flex: 1,
        alignSelf: 'flex-end',
        flexBasis: 18,
        flexGrow: 0,
        flexShrink: 0,
    },
});

export default DeletedProductsWidget;
