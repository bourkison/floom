import {Feather} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Text,
} from 'react-native';

import {PALETTE} from '@/constants';
import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {loadDeletedProducts} from '@/store/slices/product';

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
            await dispatch(loadDeletedProducts());
        };

        if (
            deletedProducts.length < NUM_PRODUCTS &&
            !isLoading &&
            !loadAttempted
        ) {
            setLoadAttempted(true);
            initFetch();
        } else if (!loadAttempted) {
            setLoadAttempted(true);
        }
    }, [dispatch, deletedProducts, isLoading, loadAttempted]);

    const isEmpty = useCallback(() => {
        if (!isLoading && !deletedProducts.length) {
            return true;
        }

        return false;
    }, [isLoading, deletedProducts]);

    const content = () => {
        if (isLoading) {
            return <ActivityIndicator />;
        }

        if (isEmpty()) {
            return (
                <View style={styles.noProductTextContainer}>
                    <Text style={styles.noProductText}>
                        No deleted products. Get swiping!
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.imageContainer}>
                {deletedProducts.map(product => (
                    <Image
                        key={product.id}
                        style={[imageSize]}
                        source={{uri: product.images[0]}}
                    />
                ))}
            </View>
        );
    };

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
                {content()}
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
    noProductTextContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    noProductText: {
        color: PALETTE.neutral[4],
        fontSize: 12,
        paddingHorizontal: 5,
        paddingVertical: 3,
    },
});

export default DeletedProductsWidget;
