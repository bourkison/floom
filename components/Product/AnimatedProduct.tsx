import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import React, {useCallback, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    runOnUI,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import {
    DELETE_COLOR,
    SAVE_COLOR,
    BUY_COLOR,
    IMAGE_PADDING,
    IMAGE_RATIO,
    BUY_TEXT,
    SAVE_TEXT,
    DELETE_TEXT,
} from '@/constants';
import {useSharedSavedContext} from '@/context/saved';
import {MainStackParamList} from '@/nav/Navigator';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {
    deleteProduct as storeDeleteProduct,
    buyProduct as storeBuyProduct,
    setAction as storeSetAction,
} from '@/store/slices/product';
import {Database} from '@/types/schema';

const OPACITY_MINIMUM = 0.2;
const SCALE_MULTIPLIER = 100;
const MAX_ROTATION = 10;
const ANIMATION_DURATION = 300;
const ACTION_THRESHOLD = 150;
const OVERLAY_PERCENTAGE = 0.4;

type AnimatedProductProps = {
    children: JSX.Element;
    product: Database['public']['Views']['v_products']['Row'];
    width: number;
    windowHeight: number;
    imageIndex: number;
    setImageIndex: (imageIndex: number) => void;
    index: number;
};

const AnimatedProduct: React.FC<AnimatedProductProps> = ({
    product,
    children,
    width,
    windowHeight,
    imageIndex,
    setImageIndex,
    index,
}) => {
    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

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

    const {saveProduct} = useSharedSavedContext();

    const action = useSharedValue<'idle' | 'buy' | 'save' | 'delete'>('idle');

    const dispatch = useAppDispatch();
    const animationAction = useAppSelector(state => state.product.animation);

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
            dispatch(storeSetAction(a));
        },
        [dispatch],
    );

    const cbSaveProduct = useCallback(() => {
        saveProduct(product);
    }, [saveProduct, product]);

    const deleteProduct = useCallback(() => {
        dispatch(storeDeleteProduct(product.id));
    }, [dispatch, product]);

    const buyProduct = useCallback(async () => {
        await WebBrowser.openBrowserAsync(product.link);
        dispatch(storeBuyProduct());
        setAction('idle');
        runOnUI(resetProduct)();
    }, [dispatch, resetProduct, product, setAction]);

    // Fade this product out and remove it from products array.
    // Called post pan gesture and after like animation.
    const fadeAndRemove = useCallback(
        (type: typeof animationAction) => {
            'worklet';
            if (type === 'save') {
                tileOpacity.value = withTiming(0, {}, runOnJS(cbSaveProduct));
            } else if (type === 'delete') {
                tileOpacity.value = withTiming(0, {}, runOnJS(deleteProduct));
            }
        },
        [deleteProduct, cbSaveProduct, tileOpacity],
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
        if (animationAction !== 'idle' && index === 0) {
            runOnUI(commenceAnimation)(animationAction);
        }
    }, [animationAction, commenceAnimation, index]);

    useEffect(() => {
        return () => {
            dispatch(storeSetAction('idle'));
        };
    }, [dispatch]);

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
                runOnJS(setAction)('idle');
                runOnJS(Haptics.impactAsync)();
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
                runOnJS(Haptics.impactAsync)();
            }
            // else if we're not saving and we should be (i.e. offsetX value above action threshold)
            else if (
                action.value !== 'save' &&
                offsetX.value >= ACTION_THRESHOLD
            ) {
                action.value = 'save';
                runOnJS(setAction)('save');
                runOnJS(Haptics.impactAsync)();
            }
            // finally, if we're not deleting and we should be (i.e. offsetX value below action threshold)
            else if (
                action.value !== 'delete' &&
                offsetX.value <= -ACTION_THRESHOLD
            ) {
                action.value = 'delete';
                runOnJS(setAction)('delete');
                runOnJS(Haptics.impactAsync)();
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
        Haptics.selectionAsync();

        navigation.navigate('ProductView', {
            product,
            imageIndex,
            reference: 'swipe',
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

    const calculateActionContainerPosition = useCallback(() => {
        return (width - IMAGE_PADDING) / IMAGE_RATIO / 2;
    }, [width]);

    return (
        <Animated.View style={[rTileStyle, styles.container]}>
            <GestureDetector gesture={touchGesture}>
                <GestureDetector gesture={panGesture}>
                    <View>
                        <View
                            style={[
                                styles.actionContainer,
                                {
                                    top: calculateActionContainerPosition(),
                                },
                            ]}>
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
                                <Text style={styles.saveText}>{SAVE_TEXT}</Text>
                            </Animated.View>
                        </View>

                        <View
                            style={[
                                styles.actionContainer,
                                {
                                    top: calculateActionContainerPosition(),
                                },
                            ]}>
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
                                    {DELETE_TEXT}
                                </Text>
                            </Animated.View>
                        </View>

                        <View
                            style={[
                                styles.actionContainer,
                                {
                                    top: calculateActionContainerPosition(),
                                },
                            ]}>
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
                                <Text style={styles.buyText}>{BUY_TEXT}</Text>
                            </Animated.View>
                        </View>
                        {children}
                    </View>
                </GestureDetector>
            </GestureDetector>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {zIndex: -1, elevation: -1},
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
        textTransform: 'uppercase',
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
        textTransform: 'uppercase',
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
        textTransform: 'uppercase',
    },
    actionContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        zIndex: 40,
    },
});

export default AnimatedProduct;
