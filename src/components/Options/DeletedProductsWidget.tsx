import React, {useState, useEffect} from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Text,
} from 'react-native';

import {Feather} from '@expo/vector-icons';

import {useNavigation} from '@react-navigation/native';
import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {LOAD_DELETED_PRODUCTS} from '@/store/slices/product';

const NUM_PRODUCTS = 5;

const DeletedProductsWidget = () => {
    const [loadAttempted, setLoadAttempted] = useState(false);

    const deletedProducts = useAppSelector(state => {
        const t = state.product.deleted.products.slice();
        return t.slice(0, NUM_PRODUCTS);
    });

    const isLoading = useAppSelector(state => state.product.deleted.isLoading);
    const [imageSize, setImageSize] = useState({width: 0, height: 0});

    const navigation =
        useNavigation<StackNavigationProp<OptionsStackParamList>>();

    const dispatch = useAppDispatch();

    useEffect(() => {
        const initFetch = async () => {
            dispatch(
                LOAD_DELETED_PRODUCTS({
                    queryStringParameters: {
                        loadAmount: NUM_PRODUCTS,
                        type: 'deleted',
                        reversed: true,
                    },
                    loadType: 'initial',
                }),
            );
        };

        if (
            deletedProducts.length < NUM_PRODUCTS &&
            !isLoading &&
            !loadAttempted
        ) {
            setLoadAttempted(true);
            initFetch();
        }
    }, [dispatch, deletedProducts, isLoading, loadAttempted]);

    return (
        <View
            style={styles.container}
            onLayout={({
                nativeEvent: {
                    layout: {width},
                },
            }) => {
                const n = width / NUM_PRODUCTS;
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
                                style={[imageSize]}
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
        justifyContent: 'flex-start',
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
