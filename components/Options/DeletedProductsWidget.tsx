import {Feather} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState, useEffect, useMemo} from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Text,
} from 'react-native';

import {PALETTE} from '@/constants';
import {useDeletedContext} from '@/context/deleted';
import {OptionsStackParamList} from '@/nav/types';

const NUM_PRODUCTS = 5;

const DeletedProductsWidget = () => {
    const {
        deletes,
        initFetchDeletes,
        isLoadingDeletes,
        hasInitiallyLoadedDeletes,
    } = useDeletedContext();

    const [imageSize, setImageSize] = useState({width: 0, height: 0});

    const navigation =
        useNavigation<StackNavigationProp<OptionsStackParamList>>();

    useEffect(() => {
        if (deletes.length < NUM_PRODUCTS && !hasInitiallyLoadedDeletes) {
            initFetchDeletes();
        }
    }, [deletes, hasInitiallyLoadedDeletes, initFetchDeletes]);

    const isEmpty = useMemo(() => {
        if (!isLoadingDeletes && !deletes.length) {
            return true;
        }

        return false;
    }, [deletes, isLoadingDeletes]);

    const content = () => {
        if (isLoadingDeletes) {
            return <ActivityIndicator />;
        }

        if (isEmpty) {
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
                {deletes.map(product => (
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
