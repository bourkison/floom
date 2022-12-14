import React, {useState, useMemo, useCallback} from 'react';
import {ImageBackground, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {Product as ProductType} from '@/types/product';
import {LinearGradient} from 'expo-linear-gradient';
import {useWindowDimensions} from 'react-native';
import Animated, {
    runOnJS,
    runOnUI,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {useEffect} from 'react';
import {
    SAVE_PRODUCT,
    DELETE_PRODUCT,
    BUY_PRODUCT,
} from '@/store/slices/product';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import {MainStackParamList} from '@/nav/Navigator';
import {StackNavigationProp} from '@react-navigation/stack';

import {
    IMAGE_RATIO,
    IMAGE_PADDING,
    IMAGE_GRADIENT_HEIGHT,
    FALLBACK_IMAGE,
    DELETE_COLOR,
    SAVE_COLOR,
    BUY_COLOR,
} from '@/constants';

import * as loadingImage from '@/assets/loading.png';
import * as WebBrowser from 'expo-web-browser';

type ProductComponentProps = {
    product: ProductType;
    index: number;
};

const MAX_ROTATION = 10;
const ANIMATION_DURATION = 300;

const ACTION_THRESHOLD = 150;
const SCALE_AMOUNT = 0.005;
const OPACITY_MINIMUM = 0.2;

const SCALE_MULTIPLIER = 100;

const Product: React.FC<ProductComponentProps> = ({product, index}) => {
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const rotation = useSharedValue(0);
    const rotationX = useSharedValue(0);
    const rotationY = useSharedValue(0);
    const tileOpacity = useSharedValue(1);
    const saveOpacity = useSharedValue(0);
    const deleteOpacity = useSharedValue(0);
    const buyOpacity = useSharedValue(0);
    const scale = useSharedValue(SCALE_MULTIPLIER);
    const ctx = useSharedValue({x: 0, y: 0});

    const action = useSharedValue<'idle' | 'buy' | 'save' | 'delete'>('idle');

    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
    const route = useRoute<RouteProp<MainStackParamList, 'Home'>>();

    const {width, height: windowHeight} = useWindowDimensions();

    const dispatch = useAppDispatch();
    const animationAction = useAppSelector(state => state.product.animation);
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        if (
            index === 0 &&
            route.params &&
            route.params.imageIndex &&
            route.params.imageIndex !== imageIndex
        ) {
            setImageIndex(route.params.imageIndex);
            navigation.setParams({imageIndex: undefined});
        }
    }, [route, index, imageIndex, navigation]);

    const resetProduct = useCallback(() => {
        'worklet';
        offsetX.value = withSpring(0);
        offsetY.value = withSpring(0);
        buyOpacity.value = 0;
        deleteOpacity.value = 0;
        saveOpacity.value = 0;
        rotation.value = withTiming(0);
        rotationX.value = withTiming(0);
        rotationY.value = withTiming(0);
        scale.value = withTiming(SCALE_MULTIPLIER);
    }, [
        offsetX,
        offsetY,
        buyOpacity,
        deleteOpacity,
        saveOpacity,
        rotation,
        rotationX,
        rotationY,
        scale,
    ]);

    const saveProduct = useCallback(() => {
        dispatch(SAVE_PRODUCT(product._id));
    }, [dispatch, product]);

    const deleteProduct = useCallback(() => {
        dispatch(DELETE_PRODUCT(product._id));
    }, [dispatch, product]);

    const buyProduct = useCallback(async () => {
        await WebBrowser.openBrowserAsync(product.link);
        dispatch(BUY_PRODUCT());
        runOnUI(resetProduct)();
    }, [dispatch, resetProduct, product]);

    // Fade this product out and remove it from products array.
    // Called post pan gesture and after like animation.
    const fadeAndRemove = useCallback(
        (type: typeof animationAction) => {
            'worklet';
            if (type === 'save') {
                tileOpacity.value = withTiming(0, {}, runOnJS(saveProduct));
            } else if (type === 'delete') {
                tileOpacity.value = withTiming(0, {}, runOnJS(deleteProduct));
            }
        },
        [deleteProduct, saveProduct, tileOpacity],
    );

    // Called when an action button is pressed (by watching store).
    const commenceAnimation = useCallback(
        (type: typeof animationAction) => {
            'worklet';
            if (type === 'save') {
                offsetX.value = withTiming(width * 0.75, {
                    duration: ANIMATION_DURATION,
                });
                saveOpacity.value = 1;
                rotation.value = withTiming(
                    MAX_ROTATION,
                    {
                        duration: ANIMATION_DURATION,
                    },
                    () => {
                        fadeAndRemove(type);
                    },
                );
            } else if (type === 'delete') {
                offsetX.value = withTiming(-width * 0.75, {
                    duration: ANIMATION_DURATION,
                });
                deleteOpacity.value = 1;
                rotation.value = withTiming(
                    -MAX_ROTATION,
                    {
                        duration: ANIMATION_DURATION,
                    },
                    () => {
                        fadeAndRemove(type);
                    },
                );
            } else if (type === 'buy') {
                offsetY.value = withTiming(-windowHeight * 0.25, {
                    duration: ANIMATION_DURATION,
                });
                scale.value = withSpring(1.05 * SCALE_MULTIPLIER);
                buyOpacity.value = 1;
                runOnJS(buyProduct)();
            }
        },
        [
            deleteOpacity,
            fadeAndRemove,
            offsetX,
            offsetY,
            rotation,
            saveOpacity,
            width,
            windowHeight,
            buyProduct,
            buyOpacity,
            scale,
        ],
    );

    useEffect(() => {
        if (index === 0 && animationAction !== 'idle') {
            runOnUI(commenceAnimation)(animationAction);
        }
    }, [animationAction, commenceAnimation, index]);

    const rTileStyle = useAnimatedStyle(() => {
        return {
            opacity: tileOpacity.value,
            transform: [
                {
                    translateX: offsetX.value,
                },
                {
                    translateY: offsetY.value,
                },
                {
                    rotateZ: `${rotation.value}deg`,
                },
                {
                    rotateY: `${rotationY.value}deg`,
                },
                {
                    rotateX: `${rotationX.value}deg`,
                },
                {
                    scale: scale.value / SCALE_MULTIPLIER,
                },
            ],
        };
    });

    const rSaveStyle = useAnimatedStyle(() => {
        return {
            opacity: saveOpacity.value,
        };
    });

    const rDeleteStyle = useAnimatedStyle(() => {
        return {
            opacity: deleteOpacity.value,
        };
    });

    const rBuyStyle = useAnimatedStyle(() => {
        return {
            opacity: buyOpacity.value,
        };
    });

    const panGesture = Gesture.Pan()
        .activeOffsetX([-5, 5])
        .activeOffsetY([-5, 5])
        .onStart(() => {
            ctx.value = {
                x: offsetX.value,
                y: offsetY.value,
            };
        })
        .onUpdate(e => {
            offsetX.value = e.translationX + ctx.value.x;
            offsetY.value = e.translationY + ctx.value.y;

            // Calculate rotation
            let percentageToActionX = e.translationX / ACTION_THRESHOLD;
            let percentageToActionY = -e.translationY / ACTION_THRESHOLD;
            if (percentageToActionX > 1) {
                percentageToActionX = 1;
            } else if (percentageToActionX < -1) {
                percentageToActionX = -1;
            }

            if (percentageToActionY > 1) {
                percentageToActionY = 1;
            }

            rotation.value = percentageToActionX * MAX_ROTATION;

            // If we're not idle and we should be (i.e. within the action thresholds).
            if (
                action.value !== 'idle' &&
                Math.abs(offsetX.value) < ACTION_THRESHOLD &&
                -offsetY.value < ACTION_THRESHOLD
            ) {
                action.value = 'idle';
                runOnJS(Haptics.selectionAsync)();
            }
            // else if we're not buying and we should be (i.e. offsetY value above 2x action threshold)
            else if (
                action.value !== 'buy' &&
                -offsetY.value >= ACTION_THRESHOLD
            ) {
                action.value = 'buy';
                runOnJS(Haptics.selectionAsync)();
            }
            // else if we're not saving and we should be (i.e. offsetX value above action threshold)
            else if (
                action.value !== 'save' &&
                offsetX.value >= ACTION_THRESHOLD
            ) {
                action.value = 'save';
                runOnJS(Haptics.selectionAsync)();
            }
            // finally, if we're not deleting and we should be (i.e. offsetX value below action threshold)
            else if (
                action.value !== 'delete' &&
                offsetX.value <= -ACTION_THRESHOLD
            ) {
                action.value = 'delete';
                runOnJS(Haptics.selectionAsync)();
            }

            // if (action.value !== 'buy' && -e.translationY > Math.abs(e.translationX))
            if (
                action.value === 'buy' ||
                (action.value === 'idle' &&
                    percentageToActionY > Math.abs(percentageToActionX) &&
                    percentageToActionY > OPACITY_MINIMUM)
            ) {
                buyOpacity.value = percentageToActionY;
                saveOpacity.value = 0;
                deleteOpacity.value = 0;
            } else if (
                action.value === 'save' ||
                (action.value === 'idle' &&
                    percentageToActionX > percentageToActionY &&
                    percentageToActionX > OPACITY_MINIMUM)
            ) {
                saveOpacity.value = percentageToActionX;
                deleteOpacity.value = 0;
                buyOpacity.value = 0;
            } else if (
                action.value === 'delete' ||
                (action.value === 'idle' &&
                    percentageToActionX < -percentageToActionY &&
                    percentageToActionX < -OPACITY_MINIMUM)
            ) {
                saveOpacity.value = 0;
                deleteOpacity.value = -percentageToActionX;
                buyOpacity.value = 0;
            } else {
                saveOpacity.value = 0;
                deleteOpacity.value = 0;
                buyOpacity.value = 0;
            }
        })
        .onFinalize(() => {
            if (action.value === 'save') {
                tileOpacity.value = withTiming(0, {}, () => {
                    fadeAndRemove('save');
                });
            } else if (action.value === 'delete') {
                tileOpacity.value = withTiming(0, {}, () => {
                    fadeAndRemove('delete');
                });
            } else if (action.value === 'buy') {
                scale.value = withSpring(1.05 * SCALE_MULTIPLIER);
                runOnJS(buyProduct)();
            } else {
                offsetX.value = withSpring(0);
                offsetY.value = withSpring(0);
                rotation.value = withSpring(0);
                saveOpacity.value = withTiming(0);
                deleteOpacity.value = withTiming(0);
                buyOpacity.value = withTiming(0);
            }

            action.value = 'idle';
        });

    const openProduct = () => {
        navigation.navigate('ProductView', {
            product: product,
            imageIndex: imageIndex,
        });
    };

    const touchGesture = Gesture.Tap().onTouchesUp(e => {
        const TAP_PERCENTILE = 5; // If 4, first and last quarters of the image will change image.
        const ROTATION_Y = 12;
        const ROTATION_X = 2;
        const height = (width - IMAGE_PADDING) / IMAGE_RATIO;

        if (e.allTouches[0].x < (width - IMAGE_PADDING) / TAP_PERCENTILE) {
            if (imageIndex > 0) {
                // LEFT TAP

                // Y ROTATION
                rotationY.value = withTiming(
                    -ROTATION_Y,
                    {duration: ANIMATION_DURATION},
                    () => {
                        rotationY.value = withTiming(0, {
                            duration: ANIMATION_DURATION,
                        });
                    },
                );

                // X ROTATION
                const yPercentage = -((e.allTouches[0].y / height) * 2 - 1);
                rotationX.value = withTiming(
                    ROTATION_X * yPercentage,
                    {duration: ANIMATION_DURATION},
                    () => {
                        rotationX.value = withTiming(0, {
                            duration: ANIMATION_DURATION,
                        });
                    },
                );
                runOnJS(setImageIndex)(imageIndex - 1);
                runOnJS(Haptics.selectionAsync)();
            }
        } else if (
            e.allTouches[0].x >
            ((width - IMAGE_PADDING) * (TAP_PERCENTILE - 1)) / TAP_PERCENTILE
        ) {
            if (imageIndex < product.images.length - 1) {
                // RIGHT TAP

                // Y ROTATION
                rotationY.value = withTiming(
                    ROTATION_Y,
                    {duration: ANIMATION_DURATION},
                    () => {
                        rotationY.value = withTiming(0, {
                            duration: ANIMATION_DURATION,
                        });
                    },
                );

                // X ROTATION
                const xPercentage = (e.allTouches[0].x / height) * 2 - 1;
                rotationX.value = withTiming(
                    ROTATION_X * xPercentage,
                    {duration: ANIMATION_DURATION},
                    () => {
                        rotationX.value = withTiming(0, {
                            duration: ANIMATION_DURATION,
                        });
                    },
                );
                runOnJS(setImageIndex)(imageIndex + 1);
                runOnJS(Haptics.selectionAsync)();
            }
        } else {
            runOnJS(openProduct)();
        }
    });

    const translateY = useMemo(() => {
        const height = (width - IMAGE_PADDING) / IMAGE_RATIO;
        return -Math.floor((height * SCALE_AMOUNT * index) / 4);
    }, [index, width]);

    const calculateImageIndicator = (i: number) => {
        let style: ViewStyle = JSON.parse(
            JSON.stringify(styles.selectedImageIndicator),
        );

        if (imageIndex === i) {
            style.backgroundColor = 'rgba(243, 252, 240, 0.8)';
        }

        if (i === 0) {
            style.marginLeft = 0;
        }

        if (i === product.images.length - 1) {
            style.marginRight = 0;
        }

        return style;
    };

    let baseComponent = (
        <View
            style={[
                styles.container,
                {
                    transform: [
                        {scale: 1 + index * SCALE_AMOUNT},
                        {
                            translateY: translateY,
                        },
                    ],
                },
                {zIndex: 20 - index},
            ]}>
            <ImageBackground
                style={[
                    styles.image,
                    {
                        width: width - IMAGE_PADDING,
                        height: (width - IMAGE_PADDING) / IMAGE_RATIO,
                    },
                    {zIndex: 20 - index},
                ]}
                source={{
                    uri: product.images[imageIndex] || FALLBACK_IMAGE,
                }}
                loadingIndicatorSource={{uri: loadingImage}}>
                <View style={styles.selectedImageContainer}>
                    {product.images.map((s, i) => (
                        <View style={calculateImageIndicator(i)} key={i} />
                    ))}
                </View>
                <View style={styles.imageOverlayContainer}>
                    <View style={styles.gradientContainer}>
                        <LinearGradient
                            colors={['#00000000', '#000000']}
                            style={styles.linearGradient}>
                            <View style={styles.textContainer}>
                                <View style={styles.titleContainer}>
                                    <Text style={styles.titleText}>
                                        {product.name}
                                    </Text>
                                </View>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceText}>
                                        ${product.price.saleAmount}
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {index === 0 ? (
                        <View>
                            <View style={styles.actionContainer}>
                                <Animated.View
                                    style={[
                                        rSaveStyle,
                                        styles.saveTextContainer,
                                    ]}>
                                    <Text style={styles.saveText}>SAVE</Text>
                                </Animated.View>
                            </View>

                            <View style={styles.actionContainer}>
                                <Animated.View
                                    style={[
                                        rDeleteStyle,
                                        styles.deleteTextContainer,
                                    ]}>
                                    <Text style={styles.deleteText}>
                                        DELETE
                                    </Text>
                                </Animated.View>
                            </View>

                            <View style={styles.actionContainer}>
                                <Animated.View
                                    style={[
                                        rBuyStyle,
                                        styles.buyTextContainer,
                                    ]}>
                                    <Text style={styles.buyText}>BUY</Text>
                                </Animated.View>
                            </View>
                        </View>
                    ) : undefined}
                </View>
            </ImageBackground>
        </View>
    );

    if (index === 0) {
        return (
            <Animated.View style={[rTileStyle, {zIndex: 20 - index}]}>
                <GestureDetector gesture={touchGesture}>
                    <GestureDetector gesture={panGesture}>
                        {baseComponent}
                    </GestureDetector>
                </GestureDetector>
            </Animated.View>
        );
    } else {
        return baseComponent;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: 1,
            width: 1,
        },
        shadowOpacity: 0.2,
    },
    selectedImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flex: 1,
        height: 8,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    selectedImageIndicator: {
        flex: 1,
        marginLeft: 3,
        marginRight: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(26, 31, 37, 0.3)',
        maxWidth: '33%',
    },
    imageOverlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    gradientContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: IMAGE_GRADIENT_HEIGHT,
    },
    linearGradient: {
        flex: 1,
    },
    titleText: {
        color: '#f3fcf0',
    },
    priceText: {
        color: '#f3fcf0',
        textAlign: 'right',
    },
    textContainer: {
        position: 'absolute',
        bottom: 0,
        padding: 10,
        flex: 1,
        flexDirection: 'row',
    },
    actionContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
    saveTextContainer: {
        borderColor: SAVE_COLOR,
        borderWidth: 3,
        borderRadius: 10,
        padding: 5,
        position: 'absolute',
    },
    saveText: {
        color: SAVE_COLOR,
        fontWeight: 'bold',
        fontSize: 24,
    },
    deleteTextContainer: {
        borderColor: DELETE_COLOR,
        borderWidth: 3,
        borderRadius: 10,
        padding: 5,
        position: 'absolute',
    },
    deleteText: {
        color: DELETE_COLOR,
        fontWeight: 'bold',
        fontSize: 24,
    },
    buyTextContainer: {
        borderColor: BUY_COLOR,
        borderWidth: 3,
        borderRadius: 10,
        padding: 5,
        position: 'absolute',
    },
    buyText: {
        color: BUY_COLOR,
        fontWeight: 'bold',
        fontSize: 24,
    },
    image: {
        borderRadius: 5,
        overflow: 'hidden',
    },
    titleContainer: {flex: 3},
    priceContainer: {flex: 1},
});

export default Product;
