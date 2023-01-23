import React, {useState, useMemo, useCallback} from 'react';
import {
    ImageBackground,
    StyleSheet,
    Text,
    View,
    ViewStyle,
    TextStyle,
} from 'react-native';
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
    SET_ACTION,
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
import {capitaliseString} from '@/services';

import * as loadingImage from '@/assets/loading.png';
import * as WebBrowser from 'expo-web-browser';
import BrandLogo from '@/components/Product/BrandLogo';

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

const OVERLAY_PERCENTAGE = 0.4;

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

    const setAction = useCallback(
        (a: 'idle' | 'save' | 'buy' | 'delete') => {
            dispatch(SET_ACTION(a));
        },
        [dispatch],
    );

    const saveProduct = useCallback(() => {
        dispatch(SAVE_PRODUCT(product));
    }, [dispatch, product]);

    const deleteProduct = useCallback(() => {
        dispatch(DELETE_PRODUCT(product));
    }, [dispatch, product]);

    const buyProduct = useCallback(async () => {
        await WebBrowser.openBrowserAsync(product.link);
        dispatch(BUY_PRODUCT());
        setAction('idle');
        runOnUI(resetProduct)();
    }, [dispatch, resetProduct, product, setAction]);

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
                        runOnJS(setAction)('idle');
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
                        runOnJS(setAction)('idle');
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
            setAction,
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
                console.log('idle');
                action.value = 'idle';
                runOnJS(setAction)('idle');
                runOnJS(Haptics.selectionAsync)();
            }
            // else if we're not buying and we should be (i.e. offsetY value above 2x action threshold)
            else if (
                action.value !== 'buy' &&
                -offsetY.value >= ACTION_THRESHOLD &&
                offsetX.value < ACTION_THRESHOLD &&
                offsetX.value > -ACTION_THRESHOLD
            ) {
                action.value = 'buy';
                runOnJS(setAction)('buy');
                runOnJS(Haptics.selectionAsync)();
            }
            // else if we're not saving and we should be (i.e. offsetX value above action threshold)
            else if (
                action.value !== 'save' &&
                offsetX.value >= ACTION_THRESHOLD
            ) {
                console.log('save');
                action.value = 'save';
                runOnJS(setAction)('save');
                runOnJS(Haptics.selectionAsync)();
            }
            // finally, if we're not deleting and we should be (i.e. offsetX value below action threshold)
            else if (
                action.value !== 'delete' &&
                offsetX.value <= -ACTION_THRESHOLD
            ) {
                console.log('deleted');
                action.value = 'delete';
                runOnJS(setAction)('delete');
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
            runOnJS(setAction)('idle');
        });

    const openProduct = () => {
        navigation.navigate('ProductView', {
            product: product,
            imageIndex: imageIndex,
        });
    };

    const touchGesture = Gesture.Tap().onTouchesUp(e => {
        const TAP_PERCENTILE = 5; // If 4, first and last quarters of the image will change image.

        if (e.allTouches[0].x < (width - IMAGE_PADDING) / TAP_PERCENTILE) {
            if (imageIndex > 0) {
                // LEFT TAP
                runOnJS(setImageIndex)(imageIndex - 1);
                runOnJS(Haptics.selectionAsync)();
            }
        } else if (
            e.allTouches[0].x >
            ((width - IMAGE_PADDING) * (TAP_PERCENTILE - 1)) / TAP_PERCENTILE
        ) {
            if (imageIndex < product.images.length - 1) {
                // RIGHT TAP
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

    const calculateSavedOrDeletedStyle = (type: 'text' | 'container') => {
        let response: ViewStyle[] | TextStyle[] = [];

        if (type === 'container') {
            response.push(styles.savedOrDeletedContainer);

            if (product.saved) {
                response.push(styles.savedContainer);
            } else if (product.deleted) {
                response.push(styles.deletedContainer);
            }
        } else {
            response.push(styles.savedOrDeletedText);

            if (product.saved) {
                response.push(styles.savedText);
            } else if (product.deleted) {
                response.push(styles.deletedText);
            }
        }

        return response;
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
                <View style={calculateSavedOrDeletedStyle('container')}>
                    <Text style={calculateSavedOrDeletedStyle('text')}>
                        {product.saved
                            ? 'Saved'
                            : product.deleted
                            ? 'Deleted'
                            : undefined}
                    </Text>
                </View>
                <View style={styles.imageOverlayContainer}>
                    <View style={styles.gradientContainer}>
                        <LinearGradient
                            colors={['#00000000', '#000000']}
                            style={styles.linearGradient}>
                            <View style={styles.textContainer}>
                                <View style={styles.leftContainer}>
                                    <View style={styles.titleContainer}>
                                        <Text style={styles.titleText}>
                                            {capitaliseString(product.name)}
                                        </Text>
                                    </View>
                                    <View style={styles.brandContainer}>
                                        <BrandLogo brand={product.brand} />
                                    </View>
                                </View>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceText}>
                                        ${product.price[0].saleAmount}
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
                                        {
                                            width:
                                                (width - IMAGE_PADDING) *
                                                OVERLAY_PERCENTAGE,
                                        },
                                    ]}>
                                    <Text style={styles.saveText}>SAVE</Text>
                                </Animated.View>
                            </View>

                            <View style={styles.actionContainer}>
                                <Animated.View
                                    style={[
                                        rDeleteStyle,
                                        styles.deleteTextContainer,
                                        {
                                            width:
                                                (width - IMAGE_PADDING) *
                                                OVERLAY_PERCENTAGE,
                                        },
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
                                        {
                                            width:
                                                (width - IMAGE_PADDING) *
                                                OVERLAY_PERCENTAGE,
                                        },
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
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 3,
    },
    priceText: {
        color: '#f3fcf0',
        textAlign: 'right',
        fontSize: 18,
        fontWeight: 'bold',
    },
    textContainer: {
        position: 'absolute',
        bottom: 0,
        padding: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
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
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        position: 'absolute',
    },
    saveText: {
        color: SAVE_COLOR,
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
    },
    deleteTextContainer: {
        borderColor: DELETE_COLOR,
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        position: 'absolute',
    },
    deleteText: {
        color: DELETE_COLOR,
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
    },
    buyTextContainer: {
        borderColor: BUY_COLOR,
        borderWidth: 2,
        borderRadius: 10,
        paddingVertical: 10,
        position: 'absolute',
    },
    buyText: {
        color: BUY_COLOR,
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
    },
    image: {
        borderRadius: 5,
        overflow: 'hidden',
    },
    leftContainer: {flex: 3},
    titleContainer: {flex: 1},
    priceContainer: {flex: 1},
    brandContainer: {height: 24},
    savedOrDeletedContainer: {
        position: 'absolute',
        borderRadius: 3,
        borderWidth: 1,
        paddingVertical: 5,
        top: 35,
        width: 96,
        opacity: 0,
    },
    deletedContainer: {
        left: 10,
        transform: [{rotate: '-15deg'}],
        opacity: 1,
        borderColor: DELETE_COLOR + 'b3',
    },
    savedContainer: {
        right: 10,
        transform: [{rotate: '15deg'}],
        opacity: 1,
        borderColor: SAVE_COLOR + 'b3',
    },
    savedOrDeletedText: {
        fontWeight: '500',
        fontSize: 14,
        textAlign: 'center',
    },
    savedText: {
        color: SAVE_COLOR + 'b3',
    },
    deletedText: {
        color: DELETE_COLOR + 'b3',
    },
});

export default Product;
