import React, {useCallback, useRef, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    useWindowDimensions,
    Image,
    TouchableOpacity,
    Animated as RNAnimated,
    LayoutAnimation,
} from 'react-native';
import {Product as ProductType} from '@/types/product';
import * as Haptics from 'expo-haptics';

import {
    GestureDetector,
    Gesture,
    RectButton,
} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';

import {useAppDispatch} from '@/store/hooks';
import {DELETE_SAVED_PRODUCT} from '@/store/slices/product';

import {MainStackParamList} from '@/nav/Navigator';
import {StackNavigationProp} from '@react-navigation/stack';
import {BUY_COLOR, PALETTE} from '@/constants';
import {capitaliseString} from '@/services';
import BrandLogo from './BrandLogo';

import Swipeable from 'react-native-gesture-handler/Swipeable';

export type ProductListItemProps = {
    product: ProductType;
    index: number;
    type: 'saved' | 'deleted';
    onDelete?: (_id: string, index: number) => void;
};

export const PRODUCT_LIST_ITEM_HEIGHT = 108;

const ProductListItem: React.FC<ProductListItemProps> = ({
    product,
    index,
    type,
    onDelete,
}) => {
    const ref = useRef<Swipeable>(null);

    const dispatch = useAppDispatch();

    const [imageSize, setImageSize] = useState({width: 0, height: 0});

    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

    const deleteProduct = useCallback(() => {
        const layoutAnimConfig = {
            duration: 300,
            update: {
                type: LayoutAnimation.Types.easeInEaseOut,
            },
            delete: {
                duration: 100,
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
            },
        };

        LayoutAnimation.configureNext(layoutAnimConfig);

        if (type === 'saved') {
            dispatch(DELETE_SAVED_PRODUCT({_id: product._id, index}));
        }

        if (onDelete) {
            onDelete(product._id, index);
        }
    }, [dispatch, index, onDelete, type, product]);

    return (
        <View style={{overflow: 'hidden'}}>
            <Swipeable
                childrenContainerStyle={styles.container}
                ref={ref}
                renderRightActions={(progress, dragX) => {
                    const trans = dragX.interpolate({
                        inputRange: [0, 50, 100, 101],
                        outputRange: [-20, 0, 0, 1],
                    });

                    return (
                        <View style={styles.rightAction}>
                            <RNAnimated.Text
                                style={[
                                    styles.deleteText,
                                    {
                                        transform: [{translateX: trans}],
                                    },
                                ]}>
                                Delete
                            </RNAnimated.Text>
                        </View>
                    );
                }}
                renderLeftActions={(progress, dragX) => {
                    const trans = dragX.interpolate({
                        inputRange: [0, 50, 100, 101],
                        outputRange: [-20, 0, 0, 1],
                    });

                    return (
                        <View style={styles.leftAction}>
                            <RNAnimated.Text
                                style={[
                                    styles.deleteText,
                                    {textAlign: 'right'},
                                    {
                                        transform: [{translateX: trans}],
                                    },
                                ]}>
                                Buy
                            </RNAnimated.Text>
                        </View>
                    );
                }}
                onSwipeableWillOpen={() => {
                    Haptics.selectionAsync();
                }}
                onSwipeableOpen={direction => {
                    if (direction === 'right') {
                        deleteProduct();
                    }
                }}>
                <View style={{flex: 1, backgroundColor: PALETTE.neutral[0]}}>
                    <TouchableOpacity
                        style={styles.listView}
                        onPress={() => {
                            navigation.navigate('ProductView', {product});
                        }}>
                        <View
                            style={[
                                styles.imageContainer,
                                {flexBasis: PRODUCT_LIST_ITEM_HEIGHT},
                            ]}
                            onLayout={({
                                nativeEvent: {
                                    layout: {height},
                                },
                            }) => {
                                // Set width/height equal to lowest value of height/width
                                setImageSize({
                                    width:
                                        height -
                                        styles.imageContainer.padding * 2,
                                    height:
                                        height -
                                        styles.imageContainer.padding * 2,
                                });
                            }}>
                            <Image
                                style={[styles.image, imageSize]}
                                source={{uri: product.images[0]}}
                            />
                        </View>
                        <View style={styles.titleContainer}>
                            <Text style={styles.titleText}>
                                {capitaliseString(product.name)}
                            </Text>
                            <View style={styles.priceContainer}>
                                <Text>${product.price[0].saleAmount} </Text>
                                <BrandLogo brand={product.brand} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </Swipeable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        borderBottomColor: PALETTE.neutral[2],
        borderBottomWidth: 1,
        height: PRODUCT_LIST_ITEM_HEIGHT,
    },
    flexOne: {
        flex: 1,
    },
    deleteContainer: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: PALETTE.red[5],
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    deleteText: {
        color: '#f3fcf0',
        fontWeight: 'bold',
        fontSize: 12,
    },
    animatedZeroContainer: {
        borderTopColor: PALETTE.neutral[2],
        borderTopWidth: 1,
    },
    listView: {
        flex: 1,
        flexDirection: 'row',
        height: PRODUCT_LIST_ITEM_HEIGHT,
        width: '100%',
        backgroundColor: PALETTE.neutral[0],
    },
    imageContainer: {
        flex: 1,
        padding: 5,
        flexGrow: 0,
        flexShrink: 0,
        height: PRODUCT_LIST_ITEM_HEIGHT,
    },
    image: {},
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        marginLeft: 5,
    },
    titleText: {
        fontWeight: '500',
        fontSize: 15,
    },
    priceContainer: {
        flexDirection: 'row',
        height: 18,
        alignItems: 'center',
        marginTop: 5,
    },
    rightAction: {
        backgroundColor: PALETTE.red[5],
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    leftAction: {
        backgroundColor: BUY_COLOR,
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
});

export default ProductListItem;
