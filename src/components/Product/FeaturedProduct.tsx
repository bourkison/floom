import React, {useEffect, useState} from 'react';
import {queryProduct} from '@/api/product';
import {Product} from '@/types/product';
import {
    ActivityIndicator,
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';
import {FEATURED_PRODUCT_SIZE, PALETTE} from '@/constants';
import {capitaliseString, formatPrice} from '@/services';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

const FeaturedProduct = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState<Product>();

    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);

            const p = (
                await queryProduct({
                    init: {
                        queryStringParameters: {
                            loadAmount: 1,
                            type: 'unsaved',
                            excludeDeleted: true,
                            excludeSaved: true,
                        },
                    },
                })
            ).products[0];

            setIsLoading(false);
            setProduct(p);
        };

        fetchProduct();
    }, []);

    const press = () => {
        if (product) {
            navigation.navigate('ProductView', {
                product,
                reference: 'featured',
            });
        }
    };

    return (
        <View style={styles.container}>
            {!isLoading && product ? (
                <TouchableOpacity onPress={press}>
                    <View style={styles.loadedContainer}>
                        <Image
                            source={{uri: product.images[0]}}
                            style={{
                                width: FEATURED_PRODUCT_SIZE,
                                height: FEATURED_PRODUCT_SIZE,
                            }}
                        />
                        <View style={styles.textContainer}>
                            <View style={styles.headerContainer}>
                                <Text style={styles.headerText}>
                                    Top Liked in Mens
                                </Text>
                                <View style={styles.headerLine} />
                            </View>
                            <View style={styles.titleContainer}>
                                <Text style={styles.titleText}>
                                    {capitaliseString(product.name)}
                                </Text>
                            </View>
                            <View>
                                <Text>{formatPrice(product.price)}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ) : isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator />
                </View>
            ) : (
                <Text>Error</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 40,
    },
    loadedContainer: {
        flexDirection: 'row',
    },
    textContainer: {
        marginLeft: 5,
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        color: PALETTE.neutral[4],
        fontSize: 10,
        textTransform: 'uppercase',
        paddingRight: 15,
    },
    headerLine: {
        borderTopWidth: 1,
        flex: 1,
        borderColor: PALETTE.neutral[4],
    },
    titleContainer: {
        marginTop: 3,
    },
    titleText: {
        fontWeight: '500',
    },
    loadingContainer: {
        flexBasis: FEATURED_PRODUCT_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default FeaturedProduct;
