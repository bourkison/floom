import React, {useCallback, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    useWindowDimensions,
    Image,
    TouchableOpacity,
    LayoutAnimation,
} from 'react-native';
import {Product as ProductType} from '@/types/product';
import * as Haptics from 'expo-haptics';

import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    Easing,
    withTiming,
} from 'react-native-reanimated';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';

import {useAppDispatch} from '@/store/hooks';
import {DELETE_SAVED_PRODUCT} from '@/store/slices/product';

import {MainStackParamList} from '@/nav/Navigator';
import {StackNavigationProp} from '@react-navigation/stack';
import {BUY_COLOR, PALETTE, SAVE_COLOR} from '@/constants';
import {capitaliseString} from '@/services';
import BrandLogo from './BrandLogo';
import * as WebBrowser from 'expo-web-browser';

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
    const contextX = useSharedValue(0);
    const offsetX = useSharedValue(0);
    const rightSwipeOpacity = useSharedValue(0);
    const leftSwipeOpacity = useSharedValue(1);
    const percentageX = useSharedValue(0);

    const isDeleting = useSharedValue(false);
    const isRightSwipeActive = useSharedValue(false);
    const isAnimating = useSharedValue(false);

    const {width} = useWindowDimensions();
    const dispatch = useAppDispatch();

    const [imageContSize, setImageContSize] = useState(1);
    const [imageSize, setImageSize] = useState({width: 0, height: 0});

    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: offsetX.value,
                },
            ],
        };
    });

    const rRightSwipeStyle = useAnimatedStyle(() => {
        return {
            opacity: leftSwipeOpacity.value,
        };
    });

    const rLeftSwipeStyle = useAnimatedStyle(() => {
        return {
            opacity: rightSwipeOpacity.value,
        };
    });

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

    const buyProduct = async () => {
        await WebBrowser.openBrowserAsync(product.link);
        offsetX.value = withTiming(0, {
            easing: Easing.inOut(Easing.quad),
        });
    };

    const navigateToProduct = useCallback(() => {
        navigation.navigate('ProductView', {
            product: product,
        });
    }, [navigation, product]);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-10, 10])
        .onStart(() => {
            contextX.value = offsetX.value;
        })
        .onUpdate(e => {
            if (!isAnimating.value) {
                let percentage = -(e.translationX + contextX.value) / width;

                if (percentage > 0.5 && !isDeleting.value) {
                    isDeleting.value = true;
                    runOnJS(Haptics.selectionAsync)();
                } else if (percentage < 0.5 && isDeleting.value) {
                    isDeleting.value = false;
                    runOnJS(Haptics.selectionAsync)();
                } else if (percentage < -0.5 && !isRightSwipeActive.value) {
                    isRightSwipeActive.value = true;
                    runOnJS(Haptics.selectionAsync)();
                } else if (percentage > -0.5 && isRightSwipeActive.value) {
                    isRightSwipeActive.value = false;
                    runOnJS(Haptics.selectionAsync)();
                }

                leftSwipeOpacity.value = percentage < 0 ? 1 : 0;
                rightSwipeOpacity.value = percentage > 0 ? 1 : 0;

                percentageX.value = interpolate(
                    percentage,
                    [-1, -0.55, -0.4, 0, 0.4, 0.55, 1],
                    [-0.9, -0.95, -0.4, 0, 0.4, 0.85, 0.9],
                );

                offsetX.value = -percentageX.value * width;
            }
        })
        .onEnd(e => {
            if (isDeleting.value && e.state === 5) {
                // Run delete animation and remove from the store.
                offsetX.value = withTiming(-width, {duration: 100}, () => {
                    runOnJS(deleteProduct)();
                });
            } else if (isRightSwipeActive.value && e.state === 5) {
                offsetX.value = withTiming(width, {duration: 500});
                runOnJS(buyProduct)();
            } else {
                offsetX.value = withTiming(0, {
                    easing: Easing.inOut(Easing.quad),
                });
            }
        });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.deleteContainer, rLeftSwipeStyle]}>
                <Text style={styles.deleteText}>Delete</Text>
            </Animated.View>
            <Animated.View
                style={[
                    styles.rightSwipeContainer,
                    {
                        backgroundColor:
                            type === 'saved' ? BUY_COLOR : SAVE_COLOR,
                    },
                    rRightSwipeStyle,
                ]}>
                <Text style={styles.deleteText}>
                    {type === 'saved' ? 'Buy' : 'Save'}
                </Text>
            </Animated.View>
            <Animated.View
                style={[
                    styles.animatedContainer,
                    index === 0 ? styles.animatedZeroContainer : undefined,
                    rStyle,
                ]}>
                <GestureDetector gesture={panGesture}>
                    <TouchableOpacity
                        onPress={navigateToProduct}
                        style={styles.listView}
                        delayPressIn={50}>
                        <View
                            style={[
                                styles.imageContainer,
                                {flexBasis: imageContSize},
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
                                setImageContSize(height);
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
                </GestureDetector>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        height: PRODUCT_LIST_ITEM_HEIGHT,
        backgroundColor: PALETTE.neutral[0],
    },
    flexOne: {
        flex: 1,
    },
    animatedContainer: {
        borderBottomColor: PALETTE.neutral[2],
        borderBottomWidth: 1,
        backgroundColor: PALETTE.neutral[0],
        width: '100%',
        height: '100%',
    },
    deleteContainer: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: PALETTE.red[5],
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    rightSwipeContainer: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    deleteText: {
        color: '#f3fcf0',
        marginRight: 10,
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
    },
    imageContainer: {
        flex: 1,
        padding: 5,
        flexGrow: 0,
        flexShrink: 0,
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
});

export default ProductListItem;
